// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
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
contract OneCountryManager is ERC721, Pausable, Ownable {
    using Address for address;
    uint256 public baseRentalPrice;
    uint256 public rentalPeriod;
    uint32 public priceMultiplier;

    // TODO remove nameExists and replace logic with renter not equal to zero address
    struct NameRecord {
        address renter;
        uint256 lastPaidPrice;
        uint256 updated;
        string url;
    }

    mapping(bytes32 => NameRecord) nameRecords;

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
        string memory _name,
        string memory _symbol,
        uint256 _baseRentalPrice,
        uint256 _rentalPeriod,
        uint32 _priceMultiplier
    ) ERC721(_name, _symbol) {
        baseRentalPrice = _baseRentalPrice;
        rentalPeriod = _rentalPeriod * 1 days;
        priceMultiplier = _priceMultiplier;
    }

    // ------------------
    // Functions for the owner (Updating control variables) and Pausing UnPausing
    // ------------------

    function setBaseRentalPrice(uint256 _baseRentalPrice) public onlyOwner {
        baseRentalPrice = _baseRentalPrice;
    }

    function setRentalPeriod(uint256 _rentalPeriod) public onlyOwner {
        rentalPeriod = _rentalPeriod;
    }

    function setPriceMultiplier(uint32 _priceMultiplier) public onlyOwner {
        priceMultiplier = _priceMultiplier;
    }

    /**
     * @dev `adminPauseOneCountryManager` pauses the `OneCountryManager` contract
     */
    function adminPauseOneCountryManager() external onlyOwner {
        _pause();
    }

    /**
     * @dev `adminUnpauseOneCountryManager` unpauses the `OneCountryManager` contract
     */
    function adminUnpauseOneCountryManager() external onlyOwner {
        _unpause();
    }

    // -----------------
    // Functions for Users and DApps
    // -----------------

    function getNameRecord(
        bytes32 name
    ) public view whenNotPaused returns (NameRecord memory, uint256) {
        uint256 nameAquisitionPrice = baseRentalPrice;
        NameRecord memory nameRecord = nameRecords[name];
        uint256 nameRecordExpires = nameRecord.updated + rentalPeriod;
        if (nameRecordExpires > block.timestamp) {
            if (nameRecord.renter == msg.sender) {
                nameAquisitionPrice = nameRecord.lastPaidPrice;
            } else {
                nameAquisitionPrice =
                    nameRecord.lastPaidPrice *
                    priceMultiplier;
            }
        }

        return (nameRecord, nameAquisitionPrice);
    }

    function rentName(
        bytes memory name,
        string memory url
    ) public payable whenNotPaused returns (bool) {
        bytes32 nameHash = keccak256(name);
        NameRecord memory nameRecord;
        uint256 nameAquisitionPrice;
        (nameRecord, nameAquisitionPrice) = getNameRecord(nameHash);
        // check msg.amount > nameAquisitionPrice
        require(
            nameAquisitionPrice <= msg.value,
            "OneCountryManager: Ether value sent is too low"
        );
        uint256 excess = msg.value - nameAquisitionPrice;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
        uint256 tokenId = uint256(nameHash);
        // if NFT exists (previously rented) then transfer else mint
        if (_exists(tokenId)) {
            safeTransferFrom(nameRecord.renter, msg.sender, tokenId);
        } else {
            _safeMint(msg.sender, tokenId);
        }
        //Update the Name Record
        nameRecord.renter = msg.sender;
        nameRecord.lastPaidPrice = nameAquisitionPrice;
        nameRecord.updated = block.timestamp;
        nameRecord.url = url;
        nameRecords[nameHash] = nameRecord;
        return true;
    }

    function updateURL(
        bytes memory name,
        string memory url
    ) public payable whenNotPaused returns (bool) {
        require(
            (nameRecords[keccak256(name)].renter) == msg.sender,
            "OneCountryManager: only current renter can updateURL"
        );
        nameRecords[keccak256(name)].url = url;
        return true;
    }
}
