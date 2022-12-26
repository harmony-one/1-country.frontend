// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./interfaces/IAddressRegistry.sol";
import "./interfaces/ID1DCV2.sol";

contract VanityURL is OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {
    /// @dev AddressRegistry contract
    IAddressRegistry public addressRegistry;

    /// @dev D1DCV2 TokenId -> Timestamp the name owner was updated
    mapping(bytes32 => uint256) public nameOwnerUpdateAt;

    /// @dev D1DCV2 TokenId -> Alias Name -> URL
    mapping(bytes32 => mapping(string => string)) public vanityURLs;

    /// @dev D1DCV2 Token Id -> Alias Name -> Vanity URL -> Timestamp the URL was updated
    /// @dev Vanity URL is valid only if nameOwnerUpdateAt <= vanityURLUpdatedAt
    mapping(bytes32 => mapping(string => mapping(string => uint256))) public vanityURLUpdatedAt;

    /// @dev Price for the url update
    uint256 public urlUpdatePrice;

    event NewURLSet(address by, string indexed name, string indexed aliasName, string indexed url);
    event URLDeleted(address by, string indexed name, string indexed aliasName, string indexed url);
    event URLUpdated(address by, string indexed name, string indexed aliasName, string oldURL, string indexed newURL);

    modifier onlyD1DCV2NameOwner(string memory _name) {
        bytes32 tokenId = keccak256(bytes(_name));
        ID1DCV2 d1dcV2 = ID1DCV2(addressRegistry.d1dcV2());
        (address nameOwner,,,,,) = d1dcV2.nameRecords(tokenId);
        require(msg.sender == nameOwner, "VanityURL: only D1DCV2");
        _;
    }
    
    function initialize(
        address _addressRegistry,
        uint256 _urlUpdatePrice
    ) external initializer {
        __Ownable_init();
        __ReentrancyGuard_init();

        addressRegistry = IAddressRegistry(_addressRegistry);
        urlUpdatePrice = _urlUpdatePrice;
    }

    function setNameOwnerUpdateAt(bytes32 _d1dcV2TokenId) external {
        address d1dcV2 = addressRegistry.d1dcV2();
        require(msg.sender == d1dcV2, "VanityURL: only D1DCV2");
        
        nameOwnerUpdateAt[_d1dcV2TokenId] = block.timestamp;
    }

    function updateURLUpdatePrice(uint256 _urlUpdatePrice) external onlyOwner {
        urlUpdatePrice = _urlUpdatePrice;
    }

    function setNewURL(string memory _name, string memory _aliasName, string memory _url) external payable nonReentrant whenNotPaused onlyD1DCV2NameOwner(_name) {
        bytes32 tokenId = keccak256(bytes(_name));
        require(vanityURLUpdatedAt[tokenId][_aliasName][_url] < nameOwnerUpdateAt[tokenId], "VanityURL: url already exists");

        uint256 price = urlUpdatePrice;
        require(price <= msg.value, "VanityURL: insufficient payment");

        // set a new URL
        vanityURLs[tokenId][_aliasName] = _url;
        vanityURLUpdatedAt[tokenId][_aliasName][_url] = block.timestamp;

        // returns the exceeded payment
        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool success,) = msg.sender.call{value : excess}("");
            require(success, "cannot refund excess");
        }

        emit NewURLSet(msg.sender, _name, _aliasName, _url);
    }

    function deleteURL(string memory _name, string memory _aliasName) external whenNotPaused onlyD1DCV2NameOwner(_name) {
        bytes32 tokenId = keccak256(bytes(_name));
        string memory url = vanityURLs[tokenId][_aliasName];
        require(nameOwnerUpdateAt[tokenId] <= vanityURLUpdatedAt[tokenId][_aliasName][url], "VanityURL: invalid URL");

        emit URLDeleted(msg.sender, _name, _aliasName, url);

        // delete the URL
        string memory emptyURL = "";
        vanityURLs[tokenId][_aliasName] = emptyURL;
        vanityURLUpdatedAt[tokenId][_aliasName][emptyURL] = block.timestamp;
    }

    function updateURL(string memory _name, string memory _aliasName, string memory _url) external whenNotPaused onlyD1DCV2NameOwner(_name) {
        bytes32 tokenId = keccak256(bytes(_name));
        require(nameOwnerUpdateAt[tokenId] <= vanityURLUpdatedAt[tokenId][_aliasName][_url], "VanityURL: invalid URL");

        emit URLUpdated(msg.sender, _name, _aliasName, vanityURLs[tokenId][_aliasName], _url);

        // update the URL
        vanityURLs[tokenId][_aliasName] = _url;
        vanityURLUpdatedAt[tokenId][_aliasName][_url] = block.timestamp;
    }

    function getURL(string memory _name, string memory _aliasName) external view returns (string memory) {
        bytes32 tokenId = keccak256(bytes(_name));

        return vanityURLs[tokenId][_aliasName];
    }
}
