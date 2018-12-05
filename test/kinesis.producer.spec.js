const { expect } = require('chai');
const sinon = require('sinon');

const KinesisProducer = require('../src/kinesis.producer');

const config = {
  producer: {
    stream: 'twitter',
    shards: 1,
  },
};

const client = {
  describeStream: () => ({ promise: () => Promise.resolve() }),
  createStream: () => ({ promise: () => Promise.resolve() }),
  putRecord: () => ({ promise: () => Promise.resolve() }),
};

const awaitData = statusName => ({
  StreamDescription: {
    StreamStatus: statusName,
  },
});

describe('Kinesis producer test suite', () => {
  let kinesisProducer;

  beforeEach(() => {
    kinesisProducer = new KinesisProducer(config, client);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should should create a stream and await for it to be active', async () => {
    let awaitCount = 0;
    const awaitStreamStub = sinon.stub(kinesisProducer.kinesis, 'describeStream').returns({
      promise: async () => {
        if (awaitCount === 0) {
          awaitCount += 1;
          return awaitData('INACTIVE');
        }

        return awaitData('ACTIVE');
      },
    });

    const createStreamStub = sinon.stub(kinesisProducer.kinesis, 'createStream').returns({
      promise: () => Promise.resolve(),
    });

    await kinesisProducer.createStreamIfNotCreated();

    const expectedParams = {
      ShardCount: config.producer.shards,
      StreamName: config.producer.stream,
    };

    expect(awaitStreamStub.calledTwice).to.equal(true);
    expect(createStreamStub.firstCall.args[0]).to.eql(expectedParams);
  });

  it('Should not log the ResourceInUseException error and await for stream to be active', async () => {
    const awaitStreamStub = sinon.stub(kinesisProducer.kinesis, 'describeStream').returns({
      promise: async () => awaitData('ACTIVE'),
    });

    sinon.stub(kinesisProducer.kinesis, 'createStream').returns({
      promise: async () => {
        const error = new Error();
        error.code = 'ResourceInUseException';

        throw error;
      },
    });

    const logSpy = sinon.spy(console, 'error');

    await kinesisProducer.createStreamIfNotCreated();

    expect(awaitStreamStub.calledOnce).to.equal(true);
    expect(logSpy.notCalled).to.equal(true);
  });

  it('Should log the errors while creating stream', async () => {
    const logStub = sinon.stub(console, 'error').returns();

    sinon.stub(kinesisProducer.kinesis, 'describeStream').returns({
      promise: () => Promise.reject(),
    });

    sinon.stub(kinesisProducer.kinesis, 'createStream').returns({
      promise: async () => {
        const error = new Error();
        error.code = 'INTERNAL ERROR';

        throw error;
      },
    });

    await kinesisProducer.createStreamIfNotCreated();

    expect(logStub.calledTwice).to.equal(true);
  });

  it('Should write to kinesis', async () => {
    const writeStub = sinon.stub(kinesisProducer.kinesis, 'putRecord').returns({
      promise: () => Promise.resolve(),
    });

    sinon.stub(Date, 'now').returns(1);
    sinon.stub(KinesisProducer, 'getUUID').returns(2);

    const writeData = { id: 123 };
    const timestamp = 1;

    const expectedRecord = {
      Data: JSON.stringify({ timestamp, data: writeData }),
      PartitionKey: 2,
      StreamName: config.producer.stream,
    };

    await kinesisProducer.writeToKinesis(writeData);

    expect(writeStub.firstCall.args[0]).to.eql(expectedRecord);
  });

  it('Should log write error', async () => {
    sinon.stub(kinesisProducer.kinesis, 'putRecord').returns({
      promise: () => Promise.reject(),
    });
    const logStub = sinon.stub(console, 'error').returns();

    await kinesisProducer.writeToKinesis('data');

    expect(logStub.calledOnce).to.equal(true);
  });
});
