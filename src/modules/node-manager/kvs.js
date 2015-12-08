var redis = require('../../../src/app/redis');
var logger = require('../../../src/app/logging').logger;
var Promise = require('bluebird');
var cbUtil = require('../../../src/framework/callback');

var nodeIdToObjectKey = function(nodeId){
    return 'nd:id->o:' + nodeId;
};

var nodeSetKey = function(nodeId){
    return 'nd:set';
};

var agentSetKey = function(nodeId){
    return 'ag:set';
};

var agentIdToObjectKey = function(agendId){
    return 'ag:id->o:' + agendId;
};


var kvs ={
    pushNodeToSet: function(node, callback){
        var key = nodeSetKey();
        redis.sadd(key, node.NodeId, function(err, result){
            cbUtil.logCallback(
                err,
                'Fail to add node' + ': ' + err,
                'Succeed to add node');
            cbUtil.handleSingleValue(callback, err, result);
        })
    },
    pushAgentToSet: function(agent, callback){
        var key = agentSetKey();
        redis.sadd(key, agent.AgentId, function(err, result){
            cbUtil.logCallback(
                err,
                'Fail to add agent' + ': ' + err,
                'Succeed to add agent');
            cbUtil.handleSingleValue(callback, err, result);
        })
    },
    remNodeFromSet: function(node, callback){
        var key = nodeSetKey();
        redis.srem(key, node.NodeId, function(err, result){
            cbUtil.logCallback(
                err,
                'Fail to rem node' + ': ' + err,
                'Succeed to rem node');
            cbUtil.handleSingleValue(callback, err, result);
        })
    },
    remAgentFromSet: function(agent, callback){
        var key = agentSetKey();
        redis.srem(key, agent.AgentId, function(err, result){
            cbUtil.logCallback(
                err,
                'Fail to rem agent' + ': ' + err,
                'Succeed to rem agent');
            cbUtil.handleSingleValue(callback, err, result);
        })
    },
    getAllNodes: function(callback){
        var key = nodeSetKey();
        redis.smembers(key, function(err, result){
            cbUtil.logCallback(
                err,
                'Fail to load all nodes' + ': ' + err,
                'Succeed to load all nodes');
            cbUtil.handleSingleValue(callback, err, JSON.parse(result));
        })
    },
    getAllAgents: function(callback){
        var key = agentSetKey();
        redis.smembers(key, function(err, result){
            cbUtil.logCallback(
                err,
                'Fail to load all agents' + ': ' + err,
                'Succeed to load all agents');
            cbUtil.handleSingleValue(callback, err, JSON.parse(result));
        })

    },
    getAgentById: function(agentId, callback){
        var key = agentIdToObjectKey(agentId);
        redis.hgetall(key, function(err, result){
            cbUtil.logCallback(
                err,
                'Fail to get agent by id ' + agentId + ': ' + err,
                'Succeed to get agent by id ' + agentId);
            cbUtil.handleSingleValue(callback, err, result);
        });
    },
    getNodeById: function(nodeId, callback){
        var key = nodeIdToObjectKey(nodeId);
        redis.hgetall(key, function(err, result){
            cbUtil.logCallback(
                err,
                'Fail to get node by id ' + nodeId + ': ' + err,
                'Succeed to get node by id ' + nodeId);
            cbUtil.handleSingleValue(callback, err, result);
        });
    },
    saveNode: function(node, callback){
        var key = nodeIdToObjectKey(node.NodeId);
        redis.hmset(key, node, function(err, result){
            cbUtil.logCallback(
                err,
                'Fail to save node err: ' + err,
                'Succeed to save node' );
            cbUtil.handleSingleValue(callback, err, result);
        });
    },
    saveAgent: function(agent, callback){
        var key = agentIdToObjectKey(agent.AgentId);
        redis.hmset(key, agent, function(err, result){
            cbUtil.logCallback(
                err,
                'Fail to save agent err: ' + err,
                'Succeed to save agent' );
            cbUtil.handleSingleValue(callback, err, result);
        });
    },
    delAgentById: function(agentId, callback){
        var key = agentIdToObjectKey(agentId);
        redis.del(key, function(err, result){
            cbUtil.logCallback(
                err,
                'Fail to del agent by id ' + agentId + ': ' + err,
                'Succeed to del agent by id ' + agentId);
            cbUtil.handleSingleValue(callback, err, result);
        });
    },
    delNodeById: function(nodeId, callback){
        var key = nodeIdToObjectKey(nodeId);
        redis.del(key, function(err, result){
            cbUtil.logCallback(
                err,
                'Fail to del node by id ' + nodeId + ': ' + err,
                'Succeed to del node by id ' + nodeId);
            cbUtil.handleSingleValue(callback, err, result);
        });
    }
};

kvs = Promise.promisifyAll(kvs);

module.exports = kvs;