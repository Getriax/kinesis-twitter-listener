const Twitter = require('twitter');

class TwitterStream {
  constructor(config, client = new Twitter(config.instance)) {
    this.client = client;
    this.filter = config.filter;
  }

  listen(callback) {
    const stream = this.client.stream('statuses/filter', { ...this.filter });

    stream.on('data', (event) => {
      if (!event || !event.text || !event.entities) {
        return;
      }

      const {
        text, entities, id_str: id, user,
      } = event;

      const match = /what is in this image\?/gi;

      if (match.exec(text) && entities.media[0] && entities.media[0].type === 'photo') {
        const imageUrl = entities.media[0].media_url;

        callback({ imageUrl, id, user: user.screen_name });
      }
    });

    stream.on('error', error => console.error(error));
  }
}

module.exports = TwitterStream;
