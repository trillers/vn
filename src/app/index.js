var app = require('./application');
var settings = require('base-settings');
var logger = require('./logging').logger;
var system = require('./system');
//var context = require('../.');
var util = require('./util');
var NodeManager = require('../modules/node-manager/node-manager');
var co = require('co');

util.mixin(app, require('./AllComplete')());
var getBroker = require('../message-broker')(app);
app.registerService(require('./settings').services.RABBITMQ);
system.addMember('application', app);
system.startup();
system.on('up', function(){
    logger.info('system is up!!!');
});
system.on('down', function(){
    logger.info('system is down!!!');
});

app['nodeManager'] = {};

util.mixin(app['nodeManager'], new NodeManager());

app.start(function(){
    co(function* (){
        yield callback()
    })
});

function* callback() {
    console.log('[system]: VN is startup!');
    var factory = yield getBroker;
    var broker = factory.brokerNodeManager;
    broker.onCommand(function(err, data) {
        co(function* (){
            try{
                //agent exist
                //check command
                var agentIds = yield app.nodeManager.getAllAgents();
                if(agentIds.indexOf(data.AgentId) >=0){
                    var agent = yield app.nodeManager.getAgentById(data.AgentId);
                    if(data.Command === 'start'){
                        if(['aborted, exited'].indexOf(agent.NewStatus)<=-1){
                            logger.warn('[system]: Failed to ' +data.Command+ ' agent that current status is '+agent.NewStatus);
                            return;
                        }
                    }
                    else if(data.Command === 'stop'){
                        if(['starting, logging, mislogged, logged, exceptional'].indexOf(agent.NewStatus)<=-1){
                            logger.warn('[system]: Failed to ' +data.Command+ ' agent that current status is '+agent.NewStatus);
                            return;
                        }
                    }
                    else if(data.Command === 'restart'){
                        if(['starting, logging, mislogged, logged, exceptional'].indexOf(agent.NewStatus)<=-1){
                            logger.warn('[system]: Failed to ' +data.Command+ ' agent that current status is '+agent.NewStatus);
                            return;
                        }
                    }
                    logger.info('[system]: Forward request to am, prepare to '+data.Command+' agent [agentId]='+data.AgentId);
                    broker.command(data, agent.NodeId);
                }else{
                    //agent not exist
                    //allow start only
                    if(data.Command === 'start'){
                        var nodeId = yield app.nodeManager.getNode();
                        if (nodeId) {
                            logger.info('[system]: Forward request to am, prepare to '+data.Command+' agent [agentId]='+data.AgentId);
                            broker.command(data, nodeId);
                            return;
                        }
                    }
                    //nothing to do
                    logger.warn('[system]: Failed to ' +data.Command+ ' agent, no such agent [agentId]='+data.AgentId);
                }
            }catch(e){
                console.error(e)
            }
        })
    });
    /**
     *  msg: {
     *      CreateTime: Number: Date#getTime() milliseconds
     *      NodeId: String
     *      OldStatus: String  reference: 'started' | 'stopped' | 'interrupted'
     *      NewStatus: String
     *      ExceptedAgentSum: 预计
     *      ActualAgentSum: 实际
     *  }
     */
    broker.onAgentManagerStatusChange(function (err, data) {
        co(function* (){
            console.log("[system]: agent manager status changed [agentId]: data.NodeId " + data.NodeId);
            console.log(data);
            if(data.NewStatus === 'started'){
                broker.infoRequest({CreateTime: (new Date()).getTime()}, data.NodeId);
            }
            yield app.nodeManager.saveOrUpdateNode(data);
        })
    });
    /**
     * Message routing: am ---> node
     *
     *  msg: {
         *      CreateTime: Number: Date#getTime() milliseconds
         *      NodeId: String
         *      RAM: String
         *      CPU: String
         *      ExceptedAgentSum: 预计
         *      ActualAgentSum: 实际
         *  }
     */
    broker.onInfoResponse(function(err, data){
        co(function* (){
            console.log("[system]: agent info response [agentId]: data.NodeId " + data.NodeId);
            console.log(data);
            yield app.nodeManager.updateAgent(data);
        })
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
    broker.onAgentStatusChange(function (err, data) {
        co(function* () {
            console.log("[system]: agent status changed [agentId]: data.AgentId" + data.AgentId);
            console.log(data);
            yield app.nodeManager.saveOrUpdateAgent(data);
            if(['aborted, exited'].indexOf(data.NewStatus) >= 0){
                yield app.nodeManager.removeAgentFromSet(data.AgentId);
            }
        })
    });

    broker.onAgentManagerHeartbeat(function(err, data){
        //TODO
    });

    broker.onAgentHeartbeat(function(err, data){
        //TODO
    })
}
