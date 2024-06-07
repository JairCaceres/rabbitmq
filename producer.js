const amqp = require('amqplib');
const { PRODUCERS, RABBITMQ_URL } = process.env;

async function createProducer(id) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  const queue = 'task_queue';

  await channel.assertQueue(queue, { durable: true });

  setInterval(() => {
    const msg = `Message from producer ${id}`;
    channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });
    console.log(`Producer ${id}: ${msg}`);
  }, 1000);

  process.on('exit', () => {
    channel.close();
    console.log(`Closing producer ${id}`);
  });
}

for (let i = 0; i < parseInt(PRODUCERS, 10); i++) {
  createProducer(i + 1);
}