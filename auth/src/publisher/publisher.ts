import amqp from "amqplib";

export async function publishToQueue(queue: string, message: any) {
  try {
    const connection = await amqp.connect("amqp://rabbitmq");
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log(`📤 Message sent to queue "${queue}"`, message);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error publishing to RabbitMQ", error);
  }
}
