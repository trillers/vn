var kvs = require('./kvs');
var util = require('./util');
var Node = require('./models').Node;

function NodeManager(){
    /**
     *  msg: {
         *      CreateTime: Number: Date#getTime() milliseconds
         *      NodeId: String
         *      RAM: String
         *      CPU: String
         *      exceptedAgentSum: 预计
         *      actualAgentSum: 实际
         *  }
     */
    this.nodeMaps ={};
    this.agentMaps = {};
}

var proto = NodeManager.prototype;

proto.getAllNodes = function* (){
    return yield kvs.getAllNodes();
};

proto.getAllAgents = function* (){
    return yield kvs.getAllAgents();
};

proto.updateNode = function* (node){
    yield kvs.saveNode(node);
};

proto.updateAgent = function* (agent){
    yield kvs.saveNode(agent);
};

proto.saveOrUpdateNode = function* (node){
    try{
        var nodeJson = node;
        var result = yield kvs.getNodeByIdAsync(node.NodeId);
        if(result){
            if(util.arr.in(['stop'], nodeJson.NewStatus)){
                yield kvs.delNodeByIdAsync(nodeJson.NodeId);
                yield kvs.remNodeFromSetAsync(nodeJson);
                return;
            }
        }else{
            yield kvs.pushNodeToSetAsync(nodeJson);
            nodeJson = new Node(node.NodeId);
        }
        yield kvs.saveNodeAsync(nodeJson);
    }catch(e){
        console.log(e)
    }
};

proto.saveOrUpdateAgent = function* (agent){
    try{
        var json = agent;
        var result = yield kvs.getAgentByIdAsync(agent.AgentId);
        if(result){
            if(util.arr.in(['stop'], json.NewStatus)){
                yield kvs.delAgentByIdAsync(json.AgentId);
                yield kvs.remAgentFromSetAsync(json);
                return;
            }
        }else{
            yield kvs.pushAgentToSetAsync(json);
            json = new Agent(json.AgentId);
        }
        yield kvs.saveAgentAsync(json);
    }catch(e){
        console.log(e)
    }
};

proto.getNode = function* (){
    var nodeMaps = yield this.getAllNodesAsync();
    if(!nodeMaps || !(nodeMaps.length)){
        return null;
    }
    var tmp = null;
    var nodes = Object.keys(nodeMaps);
    if(!nodes.length){
        return null;
    }
    for(var i= 0, len = nodes.length; i<len; i++){
        var curr = nodeMaps[nodes[i]];
        var free = curr.exceptedAgentSum - curr.actualAgentSum;
        if(!tmp){
            tmp = {};
            tmp.num = free;
            tmp.item = curr;
        } else {
            if(free > tmp.num){
                tmp.num = free;
                tmp.item = curr;
            }
            else if(free === tmp.num){
                if(curr.RAM < tmp.item.RAM){
                    tmp.num = free;
                    tmp.item = curr;
                }
            }
        }
    }
    return tmp.item;
};

module.exports = NodeManager;