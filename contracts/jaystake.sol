// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

contract JayStake {

    address public owner;
    mapping(uint256 => mapping(address => uint256)) private balances;
    mapping(address => mapping(address => bool)) private operatorApproval;
    mapping(uint256 => string) public tokenMetadata;

    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values);
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Error(ERC1155): You are not the owner");
        _;
    }

    function balanceOf(address account, uint256 id) public view returns (uint256) {
        require(account != address(0), "Error(ERC1155): Balance query for the zero address");
        return balances[id][account];
    }

    function balanceOfBatch(address[] memory accounts, uint256[] memory ids) public view returns (uint256[] memory) {
        require(accounts.length == ids.length, "Error(ERC1155): Accounts and ids length does not match");
        uint256[] memory batchBalances = new uint256[](accounts.length);
        for (uint256 i = 0; i < accounts.length; i++) {
            batchBalances[i] = balanceOf(accounts[i], ids[i]);
        }
        return batchBalances;
    }

    function setApprovalForAll(address operator, bool approved) public {
        operatorApproval[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address account, address operator) public view returns (bool) {
        return operatorApproval[account][operator];
    }

    function mint(address account, uint256 id, uint256 amount, string memory metadata) public onlyOwner {
        require(account != address(0), "Error(ERC1155): Minting to the zero address not allowed");
        
        balances[id][account] += amount;
        
        tokenMetadata[id] = metadata;

        emit TransferSingle(msg.sender, address(0), account, id, amount);
    }

    function mintBatch(address account, uint256[] memory ids, uint256[] memory amounts, string[] memory metadataList) public onlyOwner {
        require(account != address(0), "Error(ERC1155): Minting to the zero address not allowed");
        require(ids.length == amounts.length, "Error(ERC1155): IDs and amounts length does not match");
        require(ids.length == metadataList.length, "Error(ERC1155): Metadata length mismatch");

        for (uint256 i = 0; i < ids.length; i++) {
            balances[ids[i]][account] += amounts[i];
            tokenMetadata[ids[i]] = metadataList[i];
        }

        emit TransferBatch(msg.sender, address(0), account, ids, amounts);
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 amount) public {
        require(from == msg.sender || isApprovedForAll(from, msg.sender), "Error(ERC1155): You are not owner or not approved to transfer");
        require(to != address(0), "Error(ERC1155): Transfer to the zero address not allowed");
        require(balances[id][from] >= amount, "Error(ERC1155): Insufficient balance");

        balances[id][from] -= amount;
        balances[id][to] += amount;

        emit TransferSingle(msg.sender, from, to, id, amount);
    }

    function uri(uint256 tokenId) public view returns (string memory) {
        require(bytes(tokenMetadata[tokenId]).length > 0, "Error(ERC1155): Token ID does not exist");

        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{"name": "JayStake NFT #', uint2str(tokenId), '",',
            '"description": "Reward for staking pool",',
            '"image": "', tokenMetadata[tokenId], '"}'
        ))));

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }

        uint256 j = _i;
        uint256 length;
        
        while (j != 0) {
            length++;
            j /= 10;
        }

        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
      
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        
        str = string(bstr);
    }
}

library Base64 {
    string internal constant TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return '';

        string memory table = TABLE;
        uint256 encodedLen = 4 * ((data.length + 2) / 3);

        string memory result = new string(encodedLen + 32);

        assembly {
            mstore(result, encodedLen)
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)

            for {
                let dataPtr := data
                let endPtr := add(dataPtr, mload(data))
            } lt(dataPtr, endPtr) {

            } {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)

                mstore(resultPtr, shl(248, mload(add(tablePtr, and(shr(18, input), 0x3F)))))
                resultPtr := add(resultPtr, 1)
                mstore(resultPtr, shl(248, mload(add(tablePtr, and(shr(12, input), 0x3F)))))
                resultPtr := add(resultPtr, 1)
                mstore(resultPtr, shl(248, mload(add(tablePtr, and(shr(6, input), 0x3F)))))
                resultPtr := add(resultPtr, 1)
                mstore(resultPtr, shl(248, mload(add(tablePtr, and(input, 0x3F)))))
                resultPtr := add(resultPtr, 1)
            }
        }

        return result;
    }
}
