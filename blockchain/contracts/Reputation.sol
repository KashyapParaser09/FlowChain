// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Reputation {
    struct Node {
        string nodeId;
        uint256 reputation;
        bool status;
    }

    mapping(string => Node) private nodes;

    string[] private nodeIds;

    uint256 public constant TRUST_THRESHOLD = 50;

    event NodeRegistered(string nodeId, uint256 reputation, bool status);

    event ReputationUpdated(
        string nodeId,
        uint256 oldReputation,
        uint256 newReputation,
        bool status
    );

    function registerNode(string memory _nodeId) public {
        require(bytes(_nodeId).length > 0, "Node ID cannot be empty");

        require(
            bytes(nodes[_nodeId].nodeId).length == 0,
            "Node already registered"
        );

        nodes[_nodeId] = Node({nodeId: _nodeId, reputation: 100, status: true});

        nodeIds.push(_nodeId);

        emit NodeRegistered(_nodeId, 100, true);
    }

    function getNode(
        string memory _nodeId
    ) public view returns (string memory, uint256, bool) {
        require(bytes(nodes[_nodeId].nodeId).length > 0, "Node not found");

        Node memory node = nodes[_nodeId];

        return (node.nodeId, node.reputation, node.status);
    }

    function increaseReputation(string memory _nodeId, uint256 points) public {
        require(bytes(nodes[_nodeId].nodeId).length > 0, "Node not found");

        Node storage node = nodes[_nodeId];

        uint256 oldReputation = node.reputation;

        node.reputation += points;

        if (node.reputation >= TRUST_THRESHOLD) {
            node.status = true;
        }

        emit ReputationUpdated(
            _nodeId,
            oldReputation,
            node.reputation,
            node.status
        );
    }

    function decreaseReputation(string memory _nodeId, uint256 points) public {
        require(bytes(nodes[_nodeId].nodeId).length > 0, "Node not found");

        Node storage node = nodes[_nodeId];

        uint256 oldReputation = node.reputation;

        if (points >= node.reputation) {
            node.reputation = 0;
        } else {
            node.reputation -= points;
        }

        if (node.reputation < TRUST_THRESHOLD) {
            node.status = false;
        }

        emit ReputationUpdated(
            _nodeId,
            oldReputation,
            node.reputation,
            node.status
        );
    }

    function getReputation(
        string memory _nodeId
    ) public view returns (uint256) {
        require(bytes(nodes[_nodeId].nodeId).length > 0, "Node not found");

        return nodes[_nodeId].reputation;
    }

    function getStatus(string memory _nodeId) public view returns (bool) {
        require(bytes(nodes[_nodeId].nodeId).length > 0, "Node not found");

        return nodes[_nodeId].status;
    }

    function getAllNodeIds() public view returns (string[] memory) {
        return nodeIds;
    }

    function getNodeCount() public view returns (uint256) {
        return nodeIds.length;
    }

    function getAllNodes() public view returns (Node[] memory) {
        Node[] memory allNodes = new Node[](nodeIds.length);

        for (uint256 i = 0; i < nodeIds.length; i++) {
            allNodes[i] = nodes[nodeIds[i]];
        }

        return allNodes;
    }
}
