// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title NothingToken
 * @dev Implementation of the Nothing App token with bonding curve mechanics
 */
contract NothingToken is ERC20, Ownable, ReentrancyGuard {
    // Initial token price in AVAX
    uint256 public constant INITIAL_PRICE = 0.001 ether;
    
    // Price increase percentage (basis points) per mint
    // 200 = 2%
    uint256 public constant PRICE_INCREASE_BPS = 200;
    
    // Initial mint amount for each user
    uint256 public constant INITIAL_MINT_AMOUNT = 100 ether; // 100 $NTH
    
    // Total users count
    uint256 public totalUsers;
    
    // Mapping to track if an address has already minted initial tokens
    mapping(address => bool) public hasMinted;
    
    // Events
    event TokensMinted(address indexed user, uint256 amount);
    event TokensBurned(address indexed user, uint256 amount);
    event TokensSold(address indexed user, uint256 tokenAmount, uint256 avaxAmount);
    
    constructor() ERC20("Nothing Token", "NTH") {
        totalUsers = 0;
    }
    
    /**
     * @dev Mint initial tokens for new users
     */
    function mint(address _to) external nonReentrant returns (bool) {
        require(!hasMinted[_to], "Already minted initial tokens");
        
        // Mint tokens
        _mint(_to, INITIAL_MINT_AMOUNT);
        
        // Mark as minted
        hasMinted[_to] = true;
        
        // Increment user count
        totalUsers += 1;
        
        emit TokensMinted(_to, INITIAL_MINT_AMOUNT);
        
        return true;
    }
    
    /**
     * @dev Burn tokens
     * @param _amount Amount of tokens to burn
     */
    function burn(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        // Burn tokens
        _burn(msg.sender, _amount);
        
        emit TokensBurned(msg.sender, _amount);
    }
    
    /**
     * @dev Sell tokens for AVAX
     * @param _amount Amount of tokens to sell
     */
    function sell(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        // Calculate AVAX to return
        uint256 avaxToReturn = calculateSellReturn(_amount);
        
        // Check contract balance
        require(address(this).balance >= avaxToReturn, "Insufficient contract balance");
        
        // Burn tokens
        _burn(msg.sender, _amount);
        
        // Send AVAX to user
        (bool success, ) = payable(msg.sender).call{value: avaxToReturn}("");
        require(success, "AVAX transfer failed");
        
        emit TokensSold(msg.sender, _amount, avaxToReturn);
    }
    
    /**
     * @dev Calculate current token price
     * @return Current price of the token in AVAX
     */
    function getCurrentPrice() public view returns (uint256) {
        // Calculate price based on bonding curve: initialPrice * (1 + increase)^totalUsers
        // For simplicity, we use a linear increase here
        return INITIAL_PRICE + (INITIAL_PRICE * totalUsers * PRICE_INCREASE_BPS) / 10000;
    }
    
    /**
     * @dev Calculate AVAX amount to be returned when selling tokens
     * @param _tokenAmount Amount of tokens to sell
     * @return AVAX amount to be returned
     */
    function calculateSellReturn(uint256 _tokenAmount) public view returns (uint256) {
        uint256 currentPrice = getCurrentPrice();
        return (_tokenAmount * currentPrice) / 1 ether;
    }
    
    /**
     * @dev Receive function to allow contract to receive AVAX
     */
    receive() external payable {}
    
    /**
     * @dev Withdraw AVAX from contract (owner only)
     * @param _amount Amount of AVAX to withdraw
     */
    function withdrawAVAX(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient contract balance");
        payable(owner()).transfer(_amount);
    }
}
