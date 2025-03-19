import amqp from "amqplib";

export const sendMessage = async (queue: string, message: any) => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!);
  const channel = await connection.createChannel();
  const replyQueue = await channel.assertQueue("", { exclusive: true });

  return new Promise((resolve, reject) => {
    const correlationId = generateCorrelationId();

    channel.consume(
      replyQueue.queue,
      (msg) => {
        if (msg?.properties.correlationId === correlationId) {
          resolve(JSON.parse(msg.content.toString()));
          channel.close();
          connection.close();
        }
      },
      { noAck: true }
    );

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      correlationId,
      replyTo: replyQueue.queue,
    });

    setTimeout(() => {
      reject(new Error("Request timed out"));
      channel.close();
      connection.close();
    }, 5000); // Timeout after 5 seconds
  });
};

const generateCorrelationId = () => Math.random().toString(36).substring(7);
