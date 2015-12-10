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
        co(function* (err, data){
            try{
                console.log(data);
                var node = yield app.nodeManager.getNode();
                console.log(node);
                if (node) {
                    broker.command(data, node);
                }
            }catch(e){
                console.error(e)
            }
        }(err, data))
    });
    /**
     *  msg: {
     *      CreateTime: Number: Date#getTime() milliseconds
     *      NodeId: String
     *      OldStatus: String  reference: 'started' | 'stopped' | 'interrupted'
     *      NewStatus: String
     *  }
     */
    broker.onAgentManagerStatusChange(function (err, data) {
        co(function* (err, data){
            console.log("[system]: agent status manager changed [agentId]: data.NodeId " + data.NodeId);
            console.log(data);
            if(data.NewStatus === 'started'){
                broker.infoRequest({CreateTime: (new Date()).getTime()}, data.NodeId);
            }
            yield app.nodeManager.saveOrUpdateNode(data);
        }(err, data))
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
        co(function* (err, data){
            console.log("[system]: agent status manager changed [agentId]: data.NodeId " + data.NodeId);
            console.log(data);
            yield app.nodeManager.updateAgent(data);
        }(err, data))
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
        co(function* (err, data) {
            console.log("[system]: agent status changed [agentId]: data.AgentId" + data.AgentId);
            console.log(data);
            yield app.nodeManager.saveOrUpdateAgent(data);
        })
    });
}
