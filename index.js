const amqp = require('amqplib');
const config = require('config');
const logger = require('@osufpp/logger');
const Promise = require('bluebird');

Promise.promisifyAll(amqp);

const connection = amqp.connect(`amqp://${config.rabbitmq.url}${config.rabbitmq.vhost}`);

connection.catch(function (e) {
    logger.error(e);
});

module.exports = function createChannel() {
    return Promise.resolve(connection)
        .call('createChannel')
        .disposer(function (ch) {
            try {
                if (ch && ch.pending != null) {
                    ch.close();
                }
            }
            catch (err) {
                logger.error(`[AMPQ] Error disposing of channel:\n${err}`);
            }
        });
};
