// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GUIToken
 * @dev ERC20 token for the GrowIQ DeFi platform
 * Features:
 * - Standard ERC20 functionality
 * - Burnable tokens
 * - Pausable for emergency situations
 * - Owner controls for minting and administrative functions
 * - Initial supply with decimal precision
 */
contract GUIToken is ERC20, ERC20Burnable, Pausable, Ownable {
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million GUI tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion GUI tokens max
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event RewardsDistributed(address indexed to, uint256 amount);
    
    constructor() ERC20("GrowIQ Token", "GUI") Ownable(msg.sender) {
        // Mint initial supply to the contract deployer
        _mint(msg.sender, INITIAL_SUPPLY);
        emit TokensMinted(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Pause token transfers - only owner can call
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers - only owner can call
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Mint new tokens - only owner can call
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in wei units)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "GUI: Max supply exceeded");
        require(to != address(0), "GUI: Cannot mint to zero address");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Batch mint tokens to multiple addresses
     * @param recipients Array of addresses to mint to
     * @param amounts Array of amounts to mint (must match recipients length)
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) 
        public 
        onlyOwner 
    {
        require(recipients.length == amounts.length, "GUI: Arrays length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "GUI: Max supply exceeded");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "GUI: Cannot mint to zero address");
            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev Distribute rewards to farming pool participants
     * @param to Address to distribute rewards to
     * @param amount Amount of rewards to distribute
     */
    function distributeRewards(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "GUI: Cannot distribute to zero address");
        require(balanceOf(address(this)) >= amount, "GUI: Insufficient contract balance");
        
        _transfer(address(this), to, amount);
        emit RewardsDistributed(to, amount);
    }
    
    /**
     * @dev Fund the contract with tokens for rewards distribution
     * @param amount Amount of tokens to fund
     */
    function fundContract(uint256 amount) public onlyOwner {
        require(amount > 0, "GUI: Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "GUI: Insufficient balance");
        
        _transfer(msg.sender, address(this), amount);
    }
    
    /**
     * @dev Get contract's token balance (for rewards)
     */
    function getContractBalance() public view returns (uint256) {
        return balanceOf(address(this));
    }
    
    /**
     * @dev Override update function to include pause functionality
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._update(from, to, amount);
    }
    
    /**
     * @dev Emergency withdrawal function - only owner
     * Allows owner to withdraw tokens in case of emergency
     */
    function emergencyWithdraw() public onlyOwner {
        uint256 contractBalance = balanceOf(address(this));
        require(contractBalance > 0, "GUI: No tokens to withdraw");
        
        _transfer(address(this), owner(), contractBalance);
    }
}