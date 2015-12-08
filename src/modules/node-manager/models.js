function Node(id){
    this.NodeId = id;
    this.CreateTime	= (new Date()).getTime();
    this.RAM = null;
    this.CPU = null;
    this.IP = null;
    this.ExceptedAgentSum = null;
    this.ActualAgentSum	= null;
}

function Agent(id){
    this.AgentId = id;
    this.CreateTime	= (new Date()).getTime();
}

module.exports.Node = Node;
module.exports.Agent = Agent;