const AWS = require('aws-sdk');
const uuid = require('uuid');

class KinesisProducer {
  constructor(config, client = new AWS.Kinesis(config.instance)) {
    this.kinesis = client;
    this.producer = config.producer;
  }

  async waitForStreamToActivate() {
    try {
      const data = await this.kinesis.describeStream(
        { StreamName: this.producer.stream },
      ).promise();

      if (data.StreamDescription.StreamStatus === 'ACTIVE') {
        return;
      }

      await this.waitForStreamToActivate();
    } catch (error) {
      console.error(error);
    }
  }

  async createStreamIfNotCreated() {
    const params = {
      ShardCount: this.producer.shards,
      StreamName: this.producer.stream,
    };

    try {
      await this.kinesis.createStream(params).promise();
    } catch (error) {
      if (error.code !== 'ResourceInUseException') {
        console.error(error);
      }
    }

    console.log('Awaiting for stream to activate');
    await this.waitForStreamToActivate();
    console.log('Stream is active now');
  }

  async writeToKinesis(data) {
    const timestamp = Date.now();

    const record = JSON.stringify({
      timestamp,
      data,
    });

    const recordParams = {
      Data: record,
      PartitionKey: KinesisProducer.getUUID(),
      StreamName: this.producer.stream,
    };

    try {
      await this.kinesis.putRecord(recordParams).promise();
    } catch (error) {
      console.error(error);
    }
  }

  static getUUID() {
    return uuid();
  }
}

module.exports = KinesisProducer;
