require('dotenv').config();

const REQUIRED_KEYS = [
  'AWS_ACCESS_KEY_ID',
  'AWS_ACCESS_KEY_SECRET',
  'REGION',
  'TWITTER_CONSUMER_KEY',
  'TWITTER_CONSUMER_SECRET',
  'TWITTER_ACCESS_TOKEN_KEY',
  'TWITTER_ACCESS_TOKEN_SECRET',
  'TWITTER_USER_ID',
  'KINESIS_STREAM_NAME',
  'KINESIS_SHARDS_COUNT',
  'KINESIS_WAIT_BETWEEN_CALLS_MS',
];

REQUIRED_KEYS.forEach((key) => {
  if (!(key in process.env)) {
    throw new Error(`Missing required config key: ${key}`);
  }
});

const kinesis = {
  instance: {
    region: process.env.REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  },
  producer: {
    stream: process.env.KINESIS_STREAM_NAME,
    shards: process.env.KINESIS_SHARDS_COUNT,
    waitBetweenDescribeCallsInSeconds: process.env.KINESIS_WAIT_BETWEEN_CALLS_MS,
  },
};

const twitter = {
  instance: {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  },
  filter: {
    follow: process.env.TWITTER_USER_ID,
  },
};

module.exports = {
  kinesis,
  twitter,
};
