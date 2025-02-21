import amqp from "amqplib";
import { randomUUID } from "crypto";

let channel: amqp.Channel;
let connection: amqp.Connection;
const replyQueue = "auth_reply_queue";

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL!);
    channel = await connection.createChannel();
    console.log("✅ Connected to RabbitMQ");
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
export async function sendMessage(queue: string, message: any): Promise<any> {
  await ensureConnection();

  return new Promise((resolve, reject) => {
    const correlationId = randomUUID(); // Unique ID to track the response

    // Ensure reply queue exists
    channel.assertQueue(replyQueue, { durable: false });

    // Consume response from the reply queue
    channel.consume(
      replyQueue,
      (msg) => {
        if (msg?.properties.correlationId === correlationId) {
          resolve(JSON.parse(msg.content.toString()));
        }
      },
      { noAck: true }
    );

    // Send request with replyTo queue
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      replyTo: replyQueue,
      correlationId: correlationId,
    });
  });
}
