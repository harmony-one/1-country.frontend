// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
    @title A subdomain manager contract for .1.country (D1DC - Dot 1 Dot Country)
    @author John Whitton (github.com/johnwhitton), reviewed and revised by Aaron Li (github.com/polymorpher)
    @notice This contract allows the rental of domains under .1.country (”D1DC”)
    like “The Million Dollar Homepage”: Anyone can take over a domain name by 
    browsing to a web2 address like foo.1.country and doubling its last price.
    Currently, a payer owns the domain only for `rentalPeriod`, and is allowed to embed a tweet for the web page.
    D1DC creates ERC721 tokens for each domain registration.
 */
contract D1DC is ERC721, Pausable, Ownable {
    bool public initialized;
    uint256 public baseRentalPrice;
    uint32 public rentalPeriod;
    uint32 public priceMultiplier;
    address public revenueAccount;

    // TODO remove nameExists and replace logic with renter not equal to zero address
    struct NameRecord {
        address renter;
        uint32 timeUpdated;
        uint256 lastPrice;
        string url;
        string prev;
        string next;
    }

    mapping(bytes32 => NameRecord) public nameRecords;

    string public lastRented;

    string public lastCreated;

    bytes32[] public keys;

    event NameRented(string indexed name, address indexed renter, uint256 price, string url);
    event URLUpdated(string indexed name, address indexed renter, string oldUrl, string newUrl);
    event RevenueAccountChanged(address from, address to);

    //TODO create the EREC721 token at time of construction
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _baseRentalPrice,
        uint32 _rentalPeriod,
        uint32 _priceMultiplier,
        address _revenueAccount
    ) ERC721(_name, _symbol) {
        baseRentalPrice = _baseRentalPrice;
        rentalPeriod = _rentalPeriod;
        priceMultiplier = _priceMultiplier;
        revenueAccount = _revenueAccount;
    }

    function numRecords() public view returns (uint256){
        return keys.length;
    }

    function getRecordKeys(uint256 start, uint256 end) public view returns (bytes32[] memory){
        require(end > start, "D1DC: end must be greater than start");
        bytes32[] memory slice = new bytes32[](end - start);
        for (uint256 i = start; i < end; i++) {
            slice[i - start] = keys[i];
        }
        return slice;
    }

    // admin functions
    function setBaseRentalPrice(uint256 _baseRentalPrice) public onlyOwner {
        baseRentalPrice = _baseRentalPrice;
    }

    function setRentalPeriod(uint32 _rentalPeriod) public onlyOwner {
        rentalPeriod = _rentalPeriod;
    }

    function setPriceMultiplier(uint32 _priceMultiplier) public onlyOwner {
        priceMultiplier = _priceMultiplier;
    }

    function setRevenueAccount(address _revenueAccount) public onlyOwner {
        emit RevenueAccountChanged(revenueAccount, _revenueAccount);
        revenueAccount = _revenueAccount;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function initialize(string[] calldata _names, NameRecord[] calldata _records) external onlyOwner {
        require(!initialized, "D1DC: already initialized");
        require(_names.length == _records.length, "D1DC: unequal length");
        for (uint256 i = 0; i < _records.length; i++) {
            bytes32 key = keccak256(bytes(_names[i]));
            nameRecords[key] = _records[i];
            keys.push(key);
            if (i >= 1 && bytes(nameRecords[key].prev).length == 0) {
                nameRecords[key].prev = _names[i - 1];
            }
            if (i < _records.length - 1 && bytes(nameRecords[key].next).length == 0) {
                nameRecords[key].next = _names[i + 1];
            }
        }
        lastCreated = _names[_names.length-1];
        lastRented = lastCreated;
    }

    function finishInitialization() external onlyOwner {
        initialized = true;
    }

    // User functions

    function getPrice(bytes32 encodedName) public view returns (uint256) {
        NameRecord storage nameRecord = nameRecords[encodedName];
        if (nameRecord.timeUpdated + rentalPeriod <= uint32(block.timestamp)) {
            return baseRentalPrice;
        }
        return nameRecord.renter == msg.sender ? nameRecord.lastPrice : nameRecord.lastPrice * priceMultiplier;
    }

    function rent(string calldata name, string calldata url) public payable whenNotPaused {
        require(bytes(name).length <= 128, "D1DC: name too long");
        require(bytes(url).length <= 1024, "D1DC: url too long");
        uint256 tokenId = uint256(keccak256(bytes(name)));
        NameRecord storage nameRecord = nameRecords[bytes32(tokenId)];
        uint256 price = getPrice(bytes32(tokenId));
        require(price <= msg.value, "D1DC: insufficient payment");

        address originalOwner = nameRecord.renter;
        nameRecord.renter = msg.sender;
        nameRecord.lastPrice = price;
        nameRecord.timeUpdated = uint32(block.timestamp);

        if (bytes(url).length > 0) {
            nameRecord.url = url;
        }

        lastRented = name;

        if (_exists(tokenId)) {
            _safeTransfer(originalOwner, msg.sender, tokenId, "");
        } else {
            nameRecords[keccak256(bytes(lastCreated))].next = name;
            nameRecord.prev = lastCreated;
            lastCreated = name;
            _safeMint(msg.sender, tokenId);
        }

        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool success,) = msg.sender.call{value : excess}("");
            require(success, "cannot refund excess");
        }
        emit NameRented(name, msg.sender, price, url);
    }

    function updateURL(string calldata name, string calldata url) public payable whenNotPaused {
        require(nameRecords[keccak256(bytes(name))].renter == msg.sender, "D1DC: not owner");
        require(bytes(url).length <= 1024, "D1DC: url too long");
        emit URLUpdated(name, msg.sender, nameRecords[keccak256(bytes(name))].url, url);
        nameRecords[keccak256(bytes(name))].url = url;
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override virtual {
        NameRecord storage nameRecord = nameRecords[bytes32(firstTokenId)];
        nameRecord.renter = to;
    }

    function withdraw() external {
        require(msg.sender == owner() || msg.sender == revenueAccount, "D1DC: must be owner or revenue account");
        (bool success,) = revenueAccount.call{value : address(this).balance}("");
        require(success, "D1DC: failed to withdraw");
    }
}