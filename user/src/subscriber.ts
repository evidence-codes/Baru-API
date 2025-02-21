import amqp from "amqplib";

export async function consumeQueue(
  queue: string,
  callback: (msg: any) => void
) {
  try {
    const connection = await amqp.connect("amqp://rabbitmq");
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });

    console.log(`📥 Listening to queue "${queue}"`);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        callback(data);
        channel.ack(msg); // Acknowledge message processing
      }
    });
  } catch (error) {
    console.error("Error consuming RabbitMQ", error);
  }
}
