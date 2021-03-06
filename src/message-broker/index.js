var brokerFactory = require('vc');
var settings = require('base-settings');
var amqp = require('amqplib');
var rbqUri = 'amqp://' + settings.rabbitmq.username + ':' + settings.rabbitmq.password + '@' + settings.rabbitmq.host + ':' + settings.rabbitmq.port + '/' + settings.rabbitmq.vhost;
var open = amqp.connect(rbqUri);
var tempSettings = require('../app/settings');
var builder = brokerFactory.create(open, {nm: true})
module.exports = function(app){
    return builder.then(function(broker){
        app && app.emitter.emit('complete', {serviceName: tempSettings.services.RABBITMQ});
        return {
            brokerNodeManager: broker.getNodeManager(),
        };
    })
};
