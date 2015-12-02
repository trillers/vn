var app = require('./application');
var settings = require('athena-settings');
var logger = require('./logging').logger;
var system = require('./system');
var application = require('./application');
var context = require('../.');
var redisClient = require('./redis-client');
redisClient('default');
redisClient('sub');
redisClient('pub');

system.addMember('application', application);
system.startup();
system.on('up', function(){
    logger.info('system is up!!!');
});
system.on('down', function(){
    logger.info('system is down!!!');
});

app['nodeManager'] = {};

util.mixin(app['nodeManager'], new NodeManager());

app.start(callback);

function callback() {
    console.log('[system]: VN is startup!');
    getBroker.then(function (broker) {
        /**
         *  msg: {
         *      CreateTime: Number: Date#getTime() milliseconds
         *      NodeId: String
         *      OldStatus: String  reference: 'started' | 'stopped' | 'interrupted'
         *      NewStatus: String
         *  }
         */
        broker.brokerNodeManager.onAgentManagerStatusChange(function (err, data) {
            console.log("[system]: agent status manager changed [agentId]: data.NodeId " + data.NodeId);
            console.log(data);
            app.nodeManager.nodeMaps[data.NodeId] = {
                RAM: data.RAM,
                CPU: data.CPU,
                exceptedAgentSum: data.ExceptedAgentSum,
                actualAgentSum: data.ActualAgentSum
            };
        });
        /**
         *  msg: {
         *      CreateTime: Number: Date#getTime() milliseconds
         *      AgentId: String
         *      OldStatus: String
         *         reference:
         *       - starting
         *       - logging
         *       - mislogged
         *       - logged
         *       - exceptional
         *       - aborted
         *       - exited
         *      NewStatus: String
         *  }
         */
        broker.brokerNodeManager.onAgentStatusChange(function (err, data) {
            console.log("[system]: agent status changed [agentId]: data.AgentId" + data.AgentId);
            console.log(data);
            app.nodeManager.agentMaps[data.AgentId] = {
                agentId: data.AgentId,
                nodeId: data.NodeId,
                agentStatus: data.NewStatus
            };
        });

        /**
         *  Message routing: bot ---> node ( ---> am)
         *
         *  msg: {
         *      CreateTime: Number: Date#getTime() milliseconds
         *      AgentId: String
         *      Command: 'start'
         *      Intention: String 'register' | 'login'
         *      Mode: 'trusted' | 'untrusted'
         *      Nickname: String  ONLY applicable if Mode is untrusted
         *      Sex: 0 1 2        ONLY applicable if Mode is untrusted
         *      Region:           ONLY applicable if Mode is untrusted
         *  }
         *
         *  msg: {
         *      CreateTime: Number: Date#getTime() milliseconds
         *      AgentId: String
         *      Command: 'stop'
         *      Mode: 'graceful' | 'ungraceful'
         *          graceful means stop until all action messages,
         *          ungraceful means stop it right now whatever unhandled action messages there.
         *  }
         *
         *  msg: {
         *      CreateTime: Number: Date#getTime() milliseconds
         *      AgentId: String
         *      Command: 'reload'
         *      Mode: 'graceful' | 'ungraceful'
         *          graceful means reload until all action messages,
         *          ungraceful means reload it right now whatever unhandled action messages there.
         *  }
         *
         */
        broker.brokerNodeManager.onCommand(function (err, data) {
            if (data.Command === 'start') {
                console.log("[system]: agent start [agentId]: data.AgentId" + data.AgentId);
                console.log(data);

                /**
                 *  msg: {
                 *      CreateTime: Number: Date#getTime() milliseconds
                 *      NodeId: String
                 *      AgentId: String
                 *      Command: 'start'
                 *      Intention: String 'register' | 'login'
                 *      Mode: 'trusted' | 'untrusted'
                 *      Nickname: String  ONLY applicable if Mode is untrusted
                 *      Sex: 0 1 2        ONLY applicable if Mode is untrusted
                 *      Region:           ONLY applicable if Mode is untrusted
                 *  }
                 **/
                broker.brokerNodeManager.command({
                    NodeId: app.nodeManager.getNode(),
                    CreateTime: (new Date()).getTime(),
                    AgentId: data.AgentId,
                    Intention: 'login',
                    Mode: 'trusted'
                }, data.agentId)
            }
        });
    });
}
