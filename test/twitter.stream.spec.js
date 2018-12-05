const { expect } = require('chai');
const sinon = require('sinon');
const faker = require('faker');
const EvnetEmitter = require('events');

const TwitterStream = require('../src/twitter.stream');

const config = {
  filter: {
    follow: 'person',
  },
};

const eventData = ({
  text = faker.lorem.words(3),
  entities = { media: [{ media_url: faker.internet.avatar(), type: 'photo' }] },
  id_str = faker.random.uuid(),
  user = {
    user_name: faker.random.word(),
  },
}) => ({
  text, entities, id_str, user,
});

describe('Twitter stream test suite', () => {
  let twitterStream;
  let stream;

  beforeEach(() => {
    stream = new EvnetEmitter();

    const client = {
      stream: () => stream,
    };

    twitterStream = new TwitterStream(config, client);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should callback on correct data', async () => {
    const callbackSpy = sinon.spy();

    twitterStream.listen(callbackSpy);

    const data = eventData({ text: 'what is in this image?' });
    stream.emit('data', data);

    expect(callbackSpy.calledOnce).to.equal(true);
  });

  it('Should not execute callback on incorrect text', async () => {
    const callbackSpy = sinon.spy();

    twitterStream.listen(callbackSpy);

    const data = eventData({ text: 'hello there' });
    stream.emit('data', data);

    expect(callbackSpy.notCalled).to.equal(true);
  });

  it('Should not execute callback on incorrect data', async () => {
    const callbackSpy = sinon.spy();

    twitterStream.listen(callbackSpy);

    const data = { some: 'bad' };
    stream.emit('data', data);

    expect(callbackSpy.notCalled).to.equal(true);
  });

  it('Should log an error', async () => {
    const logStub = sinon.stub(console, 'error').returns();

    twitterStream.listen(() => {});

    stream.emit('error', true);

    expect(logStub.calledOnce).to.equal(true);
  });
});
