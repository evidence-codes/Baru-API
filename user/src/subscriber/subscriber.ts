import amqp from "amqplib";
import { handleUserRequest } from "./userHandler";
import { randomUUID } from "crypto";

let channel: amqp.Channel | null = null;
const replyQueue = "auth_reply_queue";

/**
 * Ensures RabbitMQ channel is available before sending messages
 */
const ensureChannel = async () => {
  if (!channel) {
    console.warn("⚠️ RabbitMQ channel lost. Reconnecting...");
    await connectRabbitMQ();
  }
  if (!channel) {
    throw new Error("❌ Failed to establish RabbitMQ channel");
  }
  return channel;
};

/**
 * Connects to RabbitMQ and initializes the channel
 */
export const connectRabbitMQ = async () => {
  try {
    console.log("🚀 Connecting to RabbitMQ...");
    const connection = await amqp.connect(process.env.RABBITMQ_URL!);
    channel = await connection.createChannel();

    connection.on("close", () => {
      console.warn("⚠️ RabbitMQ connection closed. Reconnecting...");
      setTimeout(connectRabbitMQ, 5000); // Retry after 5 seconds
    });

    connection.on("error", (err) => {
      console.error("❌ RabbitMQ connection error:", err);
      setTimeout(connectRabbitMQ, 5000); // Retry after 5 seconds
    });

    // Ensure queues exist
    await channel.assertQueue("auth_queue", { durable: true });
    await channel.assertQueue("user_queue", { durable: true });
    await channel.assertQueue(replyQueue, { durable: false });

    console.log(
      "✅ RabbitMQ connected. Listening for authentication requests..."
    );

    // Process user requests
    channel.consume("user_queue", async (msg) => {
      if (msg) await processMessage(msg, handleUserRequest);
    });

    // Consume messages from auth_queue
    // channel.consume("auth_queue", async (msg) => {
    //   if (msg) {
    //     try {
    //       const rawMessage = msg.content.toString();
    //       console.log("📩 Raw Message from Queue:", rawMessage);

    //       let request;
    //       try {
    //         request = JSON.parse(rawMessage);
    //       } catch (err: any) {
    //         console.error("❌ JSON Parsing Error:", err.message, rawMessage);
    //         (await ensureChannel()).ack(msg);
    //         return; // Exit early to avoid crashing
    //       }

    //       console.log("✅ Parsed Request:", request);

    //       // Process authentication request
    //       let response;
    //       try {
    //         response = await handleAuthRequest(request);
    //         if (response === undefined) {
    //           throw new Error("handleAuthRequest returned undefined");
    //         }
    //       } catch (err: any) {
    //         response = {
    //           error: "Failed to process request",
    //           details: err.message,
    //         };
    //       }

    //       console.log("✅ Auth request handled, response:", response);

    //       // Send response back to the replyTo queue
    //       if (msg.properties.replyTo) {
    //         const ch = await ensureChannel();
    //         ch.sendToQueue(
    //           msg.properties.replyTo,
    //           Buffer.from(JSON.stringify(response), "utf-8"),
    //           { correlationId: msg.properties.correlationId }
    //         );
    //       }

    //       (await ensureChannel()).ack(msg);
    //     } catch (error) {
    //       console.error("❌ Unexpected error processing auth request:", error);
    //     }
    //   }
    // });

    // Consume messages from reply queue
    // channel.consume(
    //   replyQueue,
    //   (msg) => {
    //     if (msg) {
    //       console.log("📩 Received reply:", msg.content.toString());
    //     }
    //   },
    //   { noAck: true }
    // );
  } catch (error) {
    console.error("❌ RabbitMQ Connection Error:", error);
    setTimeout(connectRabbitMQ, 5000); // Retry after 5 seconds
  }
};

/**
 * Sends a message to a specified RabbitMQ queue and waits for a response
 */
export const sendMessage = async (
  queue: string,
  message: object,
  timeoutMs = 5000
): Promise<any> => {
  await ensureChannel();
  const correlationId = randomUUID();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("⏳ Request timed out"));
    }, timeoutMs);

    // Start listening first
    const consumerTag = `consumer-${correlationId}`;

    channel!.consume(
      replyQueue,
      (msg) => {
        if (msg?.properties.correlationId === correlationId) {
          clearTimeout(timeout);
          const response = JSON.parse(msg.content.toString());

          console.log("📩 Forwarding reply to gateway:", response);
          resolve(response);

          channel!.ack(msg); // ✅ Acknowledge the message
          channel!.cancel(consumerTag); // ✅ Remove the listener after response
        }
      },
      { noAck: false, consumerTag }
    );

    // THEN send the request
    channel!.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      replyTo: replyQueue,
      correlationId: correlationId,
      persistent: true, // ✅ Ensures message durability
    });
  });
};

const processMessage = async (
  msg: amqp.ConsumeMessage,
  handler: (request: { type: string; data: any }) => Promise<any>
) => {
  try {
    const rawMessage = msg.content.toString();
    console.log("📩 Raw Message from Queue:", rawMessage);

    let request;
    try {
      request = JSON.parse(rawMessage);
    } catch (err: any) {
      console.error("❌ JSON Parsing Error:", err.message, rawMessage);
      (await ensureChannel()).ack(msg);
      return;
    }

    console.log("✅ Parsed Request:", request);

    let response;
    try {
      response = await handler(request);
      if (response === undefined) {
        throw new Error("Handler returned undefined");
      }
    } catch (err: any) {
      response = {
        error: "Failed to process request",
        details: err.message,
      };
    }

    console.log("✅ Request handled, response:", response);

    // Send response back to replyTo queue
    if (msg.properties.replyTo) {
      const ch = await ensureChannel();
      ch.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(response), "utf-8"),
        { correlationId: msg.properties.correlationId }
      );
    }

    (await ensureChannel()).ack(msg);
  } catch (error) {
    console.error("❌ Unexpected error processing request:", error);
  }
};
