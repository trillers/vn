function NodeManager(json){
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

proto.getNode = function(){
    var tmp = null;
    var nodes = Object.keys(this.nodeMaps);
    if(!nodes.length){
        return null;
    }
    for(var i= 0, len = nodes.length; i<len; i++){
        var curr = this.nodeMaps[nodes[i]];
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