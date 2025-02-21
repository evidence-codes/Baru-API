import amqp from "amqplib";
import { randomUUID } from "crypto";

let channel: amqp.Channel;
let connection: amqp.Connection;
let replyQueue = ""; // Store dynamically generated queue name

export const connectRabbitMQ = async () => {
  try {
    console.log("🚀 Connecting to RabbitMQ...");
    connection = await amqp.connect(process.env.RABBITMQ_URL!);
    channel = await connection.createChannel();

    // ✅ Declare a temporary, exclusive reply queue for this instance
    const { queue } = await channel.assertQueue("", {
      durable: false, // Messages do not persist after restart
      exclusive: true, // This instance only
      autoDelete: true, // Queue auto-deletes when connection closes
    });
    replyQueue = queue; // Store queue name for replies

    console.log(`✅ Connected to RabbitMQ. Reply queue: ${replyQueue}`);
  } catch (error) {
    console.error("❌ RabbitMQ Connection Error:", error);
  }
};

// Ensure RabbitMQ connection
async function ensureConnection() {
  if (!channel) {
    throw new Error(
      "RabbitMQ channel is not initialized. Call connectRabbitMQ first."
    );
  }
}

// Send message and wait for response
export async function sendMessage(
  queue: string,
  message: any,
  timeoutMs = 30000
): Promise<any> {
  await ensureConnection();

  return new Promise((resolve, reject) => {
    const correlationId = randomUUID();

    const timeout = setTimeout(() => {
      reject(new Error("⏳ Request timed out"));
    }, timeoutMs);

    const consumerTag = `consumer-${correlationId}`;

    // Consume response from the dynamically created reply queue
    const handleReply = (msg: amqp.ConsumeMessage | null) => {
      if (msg?.properties.correlationId === correlationId) {
        clearTimeout(timeout);
        // ❌ Remove this: channel.ack(msg); // No need to acknowledge when noAck: true
        channel.cancel(consumerTag);
        resolve(JSON.parse(msg.content.toString()));
      }
    };

    channel.consume(replyQueue, handleReply, { noAck: true, consumerTag });

    // Send request with dynamically assigned reply queue
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      replyTo: replyQueue,
      correlationId,
    });
  });
}
