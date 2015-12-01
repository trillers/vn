var app = require('./Application')();
var getBroker = require('../message-broker')(app);
var settings = require('./settings');
var util = require('./util');
var NodeManager = require('../node-manager/NodeManager');

app.registerService(settings.services.RABBITMQ);

app['nodeManager'] = {};

util.mixin(app['nodeManager'], new NodeManager());

app.start(callback);

function callback(){
    console.log('[system]: VN is startup!');
    getBroker.then(function(broker){
        /**
         *  msg: {
         *      CreateTime: Number: Date#getTime() milliseconds
         *      NodeId: String
         *      RAM: String
         *      CPU: String
         *      ExceptedAgentSum: 预计
         *      ActualAgentSum: 实际
         *  }
         */
        broker.brokerNodeManager.onAgentManagerStatusResponse(function(err, data){
            console.log("[system]: agent manager status response");
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
         *      NodeId: String
         *      AgentId: String
         *      AgentStatus: String
         *       - starting
         *       - logging
         *       - mislogged
         *       - logged
         *       - exceptional
         *       - aborted
         *       - exited
         *  }
         */
        broker.brokerNodeManager.onAgentStatusResponse(function(err, data){
            console.log("[system]: agent status response");
            console.log(data);
            app.nodeManager.agentMaps[data.AgentId] = {
                agentId: data.AgentId,
                nodeId: data.NodeId,
                agentStatus: data.AgentStatus
            };
        });
        /**
         *  msg: {
         *      CreateTime: Number: Date#getTime() milliseconds
         *      NodeId: String
         *      OldStatus: String  reference: 'started' | 'stopped' | 'interrupted'
         *      NewStatus: String
         *  }
         */
        broker.brokerNodeManager.onAgentManagerStatusChange(function(err, data){
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
        broker.brokerNodeManager.onAgentStatusChange(function(err, data){
            console.log("[system]: agent status changed [agentId]: data.AgentId" + data.AgentId);
            console.log(data);
            app.nodeManager.agentMaps[data.AgentId] = {
                agentId: data.AgentId,
                nodeId: data.NodeId,
                agentStatus: data.NewStatus
            };
        });
        broker.brokerNodeManager.onAgentStart(function(err, data){
            console.log("[system]: agent start [agentId]: data.AgentId" + data.AgentId);
            console.log(data);
            /**
             *  msg: {
             *      CreateTime: Number: Date#getTime() milliseconds
             *      AgentId: String
             *      Intention: String 'register' | 'login'
             *      Mode: 'trusted' | 'untrusted'
             *      Nickname: String  ONLY applicable if Mode is untrusted
             *      Sex: 0 1 2        ONLY applicable if Mode is untrusted
             *      Region:           ONLY applicable if Mode is untrusted
             *
             *  }
             */
            broker.brokerNodeManager.startRequest({
                NodeId: app.nodeManager.getNode(),
                CreateTime: (new Date()).getTime(),
                AgentId: data.AgentId,
                Intention: 'login',
                Mode: 'trusted'
            })
        });

        //test
        broker.brokerAgent.statusResponse({
            CreateTime: (new Date()).getTime(),
            AgentId: 'test1',
            Intention: 'login',
            Mode: 'trusted' | 'untrusted',
            Nickname: 'hehe',
            Sex: 1,
            Region: 'zhonggo'
        });
        broker.brokerBot.agentStart({
            CreateTime: (new Date()).getTime(),
            AgentId: 'test2',
            Intention: 'login',
            Mode: 'trusted' | 'untrusted',
            Nickname: 'hehe',
            Sex: 1,
            Region: 'zhonggo'
        })
    });
}
