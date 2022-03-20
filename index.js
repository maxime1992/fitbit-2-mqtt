const { readOptions } = require('./options');
const options = readOptions();

const mqtt = require('mqtt');
const client = mqtt.connect(`mqtts://${process.env.MQTT_HOST}:${options.mqttsPort}`, {
  protocolId: 'MQIsdp',
  protocolVersion: 3,
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASSWORD,
  rejectUnauthorized: false,
});

const { addWater } = require('./fitbit');

client.on('connect', () => {
  console.log('[debug] Connected');

  client.subscribe('fitbit-add-on/log-water', (err) => {
    console.log('[debug] Subscribe...');

    if (!err) {
      console.log('[debug] Subscribed to the topic');
    } else {
      console.log(`[debug] Couldn't subscribe to the topic`, err);
    }
  });
});

client.on('message', async (topic, message) => {
  const messageStr = message.toString();

  console.log(`[debug] Received a message:\n${messageStr}`);

  let parsedMessage;

  const parsingErrorMessage =  `Malformed message to add water. Received "${messageStr}" but expect a JSON format message with "amount" and "unit" defined`;

  try {
    parsedMessage = JSON.parse(message.toString());
  } catch (error) {
    console.log(`[debug] Failed to parse the message. ${parsingErrorMessage}`);
  }

  console.log(`[debug] Parsed message: ${parsedMessage}`);

  if (!parsedMessage || !parsedMessage.amount || !parsedMessage.unit) {
    client.publish(`fitbit-add-on/add-watter-error`, parsingErrorMessage);
    return;
  }

  try {
    await addWater(options, parsedMessage.amount, parsedMessage.unit);

    client.publish(`fitbit-add-on/add-watter-success`);
  } catch (e) {
    console.log(`[debug] Failed to add water`, e);
    client.publish(`fitbit-add-on/add-watter-error`, `Failed to add water`);
  }
});

client.on('error', (error) => {
  console.log('[debug] ERROR: ', error);
});

client.on('offline', () => {
  console.log('[debug] offline');
});

client.on('reconnect', () => {
  console.log('[debug] reconnect');
});

