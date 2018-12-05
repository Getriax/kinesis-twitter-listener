const config = require('../config');
const TwitterStream = require('./twitter.stream');
const Kinesis = require('./kinesis.producer');

const kinesis = new Kinesis(config.kinesis);
const twitterStream = new TwitterStream(config.twitter);

kinesis.createStreamIfNotCreated()
  .then(() => twitterStream.listen(data => kinesis.writeToKinesis(data)))
  .catch(error => console.error(error));
