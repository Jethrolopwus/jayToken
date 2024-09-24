// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

contract JayToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    address public owner;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _initialSupply * 10**uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        owner = msg.sender;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Not enough tokens");
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        require(balanceOf[sender] >= amount, "Error(ERC20): Not enough tokens");
        require(allowance[sender][msg.sender] >= amount, "Error(ERC20): Allowance exceeded");

        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        allowance[sender][msg.sender] -= amount;

        emit Transfer(sender, recipient, amount);
        return true;
    }

    function mint(address account, uint256 amount) public onlyOwner {
        require(account != address(0), "Error(ERC20): Cannot mint to the zero address");

        totalSupply += amount;
        balanceOf[account] += amount;

        emit Transfer(address(0), account, amount);
    }

    function burn(uint256 amount) public onlyOwner {
        require(balanceOf[msg.sender] >= amount, "Error(ERC20): Not enough tokens to burn");

        totalSupply -= amount;

        emit Transfer(msg.sender, address(0), amount);
    }
}