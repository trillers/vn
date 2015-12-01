var NodeManager = require('../src/node-manager/NodeManager');
var assert = require('chai').assert;

describe('dispatch', function(done){
    it('when the nodes have diff payload num, choose the high one', function(done){
        var nodeManager = new NodeManager();
        var mockNode1 = {
            CreateTime: (new Date()).getTime(),
            NodeId: '1',
            RAM: 0.56,
            CPU: 0,
            ExceptedAgentSum: 4,
            ActualAgentSum: 1
        };
        var mockNode2 = {
            CreateTime: (new Date()).getTime(),
            NodeId: '2',
            RAM: 0.56,
            CPU: 0,
            ExceptedAgentSum: 4,
            ActualAgentSum: 2
        };
        nodeManager.nodeMaps[mockNode1.NodeId] = mockNode1;
        nodeManager.nodeMaps[mockNode2.NodeId] = mockNode2;
        var node = nodeManager.getNode();
        console.log(node)
        assert.equal(node.NodeId, 1);
        done();
    });

    it('when the nodes have same payload num, choose the one that have low RAM consuming', function(done){
        var nodeManager = new NodeManager();
        var mockNode1 = {
            CreateTime: (new Date()).getTime(),
            NodeId: '1',
            RAM: 0.44,
            CPU: 0,
            ExceptedAgentSum: 4,
            ActualAgentSum: 2
        };
        var mockNode2 = {
            CreateTime: (new Date()).getTime(),
            NodeId: '2',
            RAM: 0.56,
            CPU: 0,
            ExceptedAgentSum: 4,
            ActualAgentSum: 2
        };
        nodeManager.nodeMaps[mockNode1.NodeId] = mockNode1;
        nodeManager.nodeMaps[mockNode2.NodeId] = mockNode2;
        var node = nodeManager.getNode();
        console.log(node)
        assert.equal(node.NodeId, 1);
        done();
    });
});