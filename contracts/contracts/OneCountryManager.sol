// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

/**
    @title A domain manager contract for .1.country
    @author John Whitton https://github.com/johnwhitton/
    @notice This contract allows the rental of domains under .1.country (”ONE Country”) 
    like “The Million Dollar Homepage”: Anyone can take over a domain name by 
    browsing to its address like foo.1.country and doubling its last price. 
    Currently a payer owns the domain only 3 months and can embed a tweet 🐦 for the domain webpage with their wallet address.
    @dev OneCountryManager creates ERC721 tokens for each domain registration owned by the Owner of this contract
    it also provides the ability for the registrant to maintain metadata. 
 */
contract OneCountryManager is Pausable, AccessControlEnumerable {
    using Address for address;
    using SafeMath for uint256;

    address public owner;
    uint256 public baseRentalPrice;
    uint256 public rentalPeriod;
    uint64 public priceMultiplier;

    // TODO remove nameExists and replace logic with renter not equal to zero address
    struct NameRecord {
        address renter;
        uint256 lastPaidPrice;
        uint256 updated;
        uint256 tokenID;
        string url;
        bool nameExists;
    }

    //TODO review if using a keccak256 of name rather than string is more efficient
    mapping(string => NameRecord) nameRecords;

    event NameRented(
        string name,
        address renter,
        uint256 lastPaidPrice,
        uint256 updated,
        uint256 expires,
        uint256 tokenID,
        string url,
        bool nameExists
    );

    event URLUpdated(string name, address renter, string oldUrl, string newUrl);

    //TODO create the EREC721 token at time of construction
    constructor(
        uint256 _baseRentalPrice,
        uint256 _rentalPeriod,
        uint64 _priceMultiplier
    ) {
        owner = msg.sender;
        baseRentalPrice = _baseRentalPrice;
        rentalPeriod = _rentalPeriod * 1 days;
        priceMultiplier = _priceMultiplier;
    }

    function getNameRecord(string memory name)
        public
        view
        returns (NameRecord memory, uint256)
    {
        uint256 nameAquisitionPrice = baseRentalPrice;
        NameRecord memory nameRecord = nameRecords[name];
        uint256 nameRecordExpires = nameRecord.updated + rentalPeriod;
        if (nameRecordExpires > block.timestamp) {
            nameAquisitionPrice = nameRecord.lastPaidPrice * priceMultiplier;
        }

        return (nameRecord, nameAquisitionPrice);
    }

    function rentName(string memory name) public payable returns (bool) {
        NameRecord memory nameRecord;
        uint256 nameAquisitionPrice;
        (nameRecord, nameAquisitionPrice) = getNameRecord(name);
        // TODO check msg.amount > nameAquisitionPrice
        // TODO mint NFT Token
        // TODO update Name Record
        return true;
    }

    function updateURL(string memory name, string memory url)
        public
        payable
        returns (bool)
    {
        require(
            (nameRecords[name].renter) == msg.sender,
            "OneCountryManager: only current renter can updateURL"
        );
        nameRecords[name].url = url;
        return true;
    }
}
