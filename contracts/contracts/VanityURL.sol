// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract VanityURL is OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {
    /// @dev Alias Name -> Owner
    mapping(string => address) public aliasOwners;

    /// @dev Alias Name -> URL
    mapping(string => string) public aliasURLs;

    /// @dev Price for the url update
    uint256 public urlUpdatePrice;

    event NewURLSet(address indexed by, string indexed aliasName, string indexed url);
    event URLDeleted(address indexed by, string aliasNAme, string url);
    event URLUpdated(address indexed by, string indexed aliasName, string indexed oldURL, string newURL);
    
    function initialize(
        uint256 _urlUpdatePrice
    ) external initializer {
        __Ownable_init();
        __ReentrancyGuard_init();

        urlUpdatePrice = _urlUpdatePrice;
    }

    function updateURLUpdatePrice(uint256 _urlUpdatePrice) external onlyOwner {
        urlUpdatePrice = _urlUpdatePrice;
    }

    function setNewURL(string memory _aliasName, string memory _url) external payable nonReentrant whenNotPaused {
        uint256 price = urlUpdatePrice;
        require(price <= msg.value, "VanityURL: insufficient payment");

        address aliasOwner = aliasOwners[_aliasName];
        require(aliasOwner == address(0), "VanityURL: url already exists");

        aliasOwners[_aliasName] = msg.sender;
        aliasURLs[_aliasName] = _url;

        // returns the exceeded payment
        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool success,) = msg.sender.call{value : excess}("");
            require(success, "cannot refund excess");
        }

        emit NewURLSet(msg.sender, _aliasName, _url);
    }

    function deleteURL(string memory _aliasName) external whenNotPaused {
        emit URLDeleted(msg.sender, _aliasName, aliasURLs[_aliasName]);

        address aliasOwner = aliasOwners[_aliasName];
        require(msg.sender == aliasOwner, "VanityURL: only alias owner");

        delete aliasOwners[_aliasName];
        delete aliasURLs[_aliasName];
    }

    function updateURL(string memory _aliasName, string memory _url) external whenNotPaused {
        emit URLUpdated(msg.sender, _aliasName, _aliasName, _url);

        address aliasOwner = aliasOwners[_aliasName];
        require(msg.sender == aliasOwner, "VanityURL: only alias owner");

        aliasURLs[_aliasName] = _url;
    }

    function getURL(string memory _aliasName) external view returns (string memory) {
        return aliasURLs[_aliasName];
    }
}
