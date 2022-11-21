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
    uint256 public baseRentalPrice;
    uint256 public rentalPeriod;
    uint32 public priceMultiplier;

    // TODO remove nameExists and replace logic with renter not equal to zero address
    struct NameRecord {
        address renter;
        uint256 lastPrice;
        uint256 timeUpdated;
        string url;
    }

    mapping(bytes32 => NameRecord) public nameRecords;

    event NameRented(string indexed name, address indexed renter, uint256 price, string url);
    event URLUpdated(string indexed name, address indexed renter, string oldUrl, string newUrl);

    //TODO create the EREC721 token at time of construction
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _baseRentalPrice,
        uint256 _rentalPeriod,
        uint32 _priceMultiplier
    ) ERC721(_name, _symbol) {
        baseRentalPrice = _baseRentalPrice;
        rentalPeriod = _rentalPeriod;
        priceMultiplier = _priceMultiplier;
    }

    // admin functions

    function setBaseRentalPrice(uint256 _baseRentalPrice) public onlyOwner {
        baseRentalPrice = _baseRentalPrice;
    }

    function setRentalPeriod(uint256 _rentalPeriod) public onlyOwner {
        rentalPeriod = _rentalPeriod;
    }

    function setPriceMultiplier(uint32 _priceMultiplier) public onlyOwner {
        priceMultiplier = _priceMultiplier;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // User functions

    function getPrice(bytes32 encodedName) public view returns (uint256) {
        NameRecord storage nameRecord = nameRecords[encodedName];
        if (nameRecord.timeUpdated + rentalPeriod <= block.timestamp) {
            return baseRentalPrice;
        }
        return nameRecord.renter == msg.sender ? nameRecord.lastPrice : nameRecord.lastPrice * priceMultiplier;
    }

    function rent(string calldata name, string calldata url) public payable whenNotPaused {
        uint256 tokenId = uint256(keccak256(bytes(name)));
        NameRecord storage nameRecord = nameRecords[bytes32(tokenId)];
        uint256 price = getPrice(bytes32(tokenId));
        require(price <= msg.value, "D1DC: insufficient payment");

        nameRecord.renter = msg.sender;
        nameRecord.lastPrice = price;
        nameRecord.timeUpdated = block.timestamp;
        nameRecord.url = url;

        if (_exists(tokenId)) {
            safeTransferFrom(nameRecord.renter, msg.sender, tokenId);
        } else {
            _safeMint(msg.sender, tokenId);
        }

        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool success,) = msg.sender.call{value : excess}("");
            require(success, "cannot refund excess");
        }
    }

    function updateURL(string calldata name, string calldata url) public payable whenNotPaused {
        require(nameRecords[keccak256(bytes(name))].renter == msg.sender, "D1DC: not owner");
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
}
