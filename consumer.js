const amqp = require('amqplib');
const { CONSUMERS, RABBITMQ_URL } = process.env;

async function createConsumer(id) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  const queue = 'task_queue';

  await channel.assertQueue(queue, { durable: true });
  await channel.prefetch(1);

  console.log(`Consumer ${id} waiting for messages...`);

  channel.consume(queue, (msg) => {
    if (msg !== null) {
      const content = msg.content.toString();
      console.log(`Consumer ${id}: ${content}`);
      channel.ack(msg);
    }
  }, { noAck: false });

  process.on('exit', () => {
    channel.close();
    console.log(`Closing consumer ${id}`);
  });
}

for (let i = 0; i < parseInt(CONSUMERS, 10); i++) {
  createConsumer(i + 1);
}