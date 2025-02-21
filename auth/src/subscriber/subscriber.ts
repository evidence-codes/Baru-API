import amqp from "amqplib";
import { handleAuthRequest } from "./authQueueHandler";
import { randomUUID } from "crypto";

let channel: amqp.Channel | null = null;
const replyQueue = "auth_reply_queue";

/**
 * Ensures RabbitMQ channel is available before sending messages
 */
const ensureChannel = async () => {
  if (!channel) {
    throw new Error(
      "❌ RabbitMQ channel not initialized. Call connectRabbitMQ first."
    );
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

    // Ensure queues exist
    await channel.assertQueue("auth_queue", { durable: true });
    await channel.assertQueue(replyQueue, { durable: false });

    console.log(
      "✅ RabbitMQ connected. Listening for authentication requests..."
    );

    // Consume messages from auth_queue
    channel.consume("auth_queue", async (msg) => {
      if (msg) {
        try {
          const request = JSON.parse(msg.content.toString());
          console.log("📩 Received auth request:", request);

          // ✅ Process authentication request safely
          let response;
          try {
            response = await handleAuthRequest(request);
            if (response === undefined) {
              throw new Error("handleAuthRequest returned undefined");
            }
          } catch (err: any) {
            response = {
              error: "Failed to process request",
              details: err.message,
            };
          }

          console.log("✅ Auth request handled, response:", response);

          // ✅ Send response back to the replyTo queue
          if (msg.properties.replyTo) {
            const channelInstance = await ensureChannel();
            channelInstance.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify(response)), // Ensure response is always defined
              { correlationId: msg.properties.correlationId }
            );
          }

          // Acknowledge message
          (await ensureChannel()).ack(msg);
        } catch (error) {
          console.error("❌ Error processing auth request:", error);
        }
      }
    });

    // Consume messages from reply queue
    channel.consume(
      replyQueue,
      (msg) => {
        if (msg) {
          console.log("📩 Received reply:", msg.content.toString());
        }
      },
      { noAck: true }
    );
  } catch (error) {
    console.error("❌ RabbitMQ Connection Error:", error);
  }
};

/**
 * Sends a message to a specified RabbitMQ queue and waits for a response
 */
export const sendMessage = async (
  queue: string,
  message: object,
  timeoutMs = 5000 // Set a timeout to prevent indefinite waiting
): Promise<any> => {
  await ensureChannel();

  return new Promise((resolve, reject) => {
    const correlationId = randomUUID(); // Unique ID for tracking response
    const timeout = setTimeout(() => {
      reject(new Error("⏳ Request timed out"));
    }, timeoutMs);

    // Consume response from the reply queue
    channel!.consume(
      replyQueue,
      (msg) => {
        if (msg?.properties.correlationId === correlationId) {
          clearTimeout(timeout);
          resolve(JSON.parse(msg.content.toString()));
        }
      },
      { noAck: true }
    );

    // Send request with replyTo queue
    channel!.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      replyTo: replyQueue,
      correlationId: correlationId,
    });
  });
};
