const _ = require('lodash');
const amqp = require('amqplib');
const config = require('config');
const logger = require('@osufpp/logger');
const Promise = require('bluebird');

Promise.promisifyAll(amqp);

const getConnection = _.once(function getConnection() {
    if (!config.rabbitmq || !config.rabbitmq.vhost) {
        throw new Error('No RabbitMQ credentials provided');
    }

    const connection = amqp.connect(`amqp://${config.rabbitmq.url}${config.rabbitmq.vhost}`);

    connection.catch(function (e) {
        logger.error(e);
    });

    return connection;
});

module.exports = function createChannel() {
    return getConnection()
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
