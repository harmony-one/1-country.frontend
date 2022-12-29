// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./interfaces/IAddressRegistry.sol";
import "./interfaces/ID1DCV2.sol";

contract VanityURL is
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    /// @dev AddressRegistry contract
    IAddressRegistry public addressRegistry;

    /// @dev D1DCV2 TokenId -> Timestamp the name owner was updated
    mapping(bytes32 => uint256) public nameOwnerUpdateAt;

    /// @dev D1DCV2 TokenId -> Alias Name -> URL
    mapping(bytes32 => mapping(string => string)) public vanityURLs;

    /// @dev D1DCV2 Token Id -> Alias Name -> Timestamp the URL was updated
    /// @dev Vanity URL is valid only if nameOwnerUpdateAt <= vanityURLUpdatedAt
    mapping(bytes32 => mapping(string => uint256)) public vanityURLUpdatedAt;

    /// @dev Price for the url update
    uint256 public urlUpdatePrice;

    /// @dev Fee withdrawal address
    address public revenueAccount;

    event NewURLSet(
        address by,
        string indexed name,
        string indexed aliasName,
        string indexed url
    );
    event URLDeleted(
        address by,
        string indexed name,
        string indexed aliasName,
        string indexed url
    );
    event URLUpdated(
        address by,
        string indexed name,
        string indexed aliasName,
        string oldURL,
        string indexed newURL
    );
    event RevenueAccountChanged(address indexed from, address indexed to);

    modifier onlyD1DCV2NameOwner(string memory _name) {
        bytes32 tokenId = keccak256(bytes(_name));
        ID1DCV2 d1dcV2 = ID1DCV2(addressRegistry.d1dcV2());
        (address nameOwner, , , , , ) = d1dcV2.nameRecords(tokenId);
        require(msg.sender == nameOwner, "VanityURL: only D1DCV2 name owner");
        _;
    }

    function initialize(
        address _addressRegistry,
        uint256 _urlUpdatePrice,
        address _revenueAccount
    ) external initializer {
        __Pausable_init();
        __Ownable_init();
        __ReentrancyGuard_init();

        addressRegistry = IAddressRegistry(_addressRegistry);
        urlUpdatePrice = _urlUpdatePrice;
        revenueAccount = _revenueAccount;
    }

    function setRevenueAccount(address _revenueAccount) public onlyOwner {
        emit RevenueAccountChanged(revenueAccount, _revenueAccount);

        revenueAccount = _revenueAccount;
    }

    function setNameOwnerUpdateAt(bytes32 _d1dcV2TokenId) external {
        address d1dcV2 = addressRegistry.d1dcV2();
        require(msg.sender == d1dcV2, "VanityURL: only D1DCV2");

        nameOwnerUpdateAt[_d1dcV2TokenId] = block.timestamp;
    }

    function updateURLUpdatePrice(uint256 _urlUpdatePrice) external onlyOwner {
        urlUpdatePrice = _urlUpdatePrice;
    }

    function setNewURL(
        string calldata _name,
        string calldata _aliasName,
        string calldata _url
    ) external payable nonReentrant whenNotPaused onlyD1DCV2NameOwner(_name) {
        require(bytes(_aliasName).length <= 1024, "VanityURL: alias too long");
        require(bytes(_url).length <= 1024, "VanityURL: url too long");

        bytes32 tokenId = keccak256(bytes(_name));
        require(
            !checkURLValidity(_name, _aliasName),
            "VanityURL: url already exists"
        );

        uint256 price = urlUpdatePrice;
        require(price <= msg.value, "VanityURL: insufficient payment");

        // set a new URL
        vanityURLs[tokenId][_aliasName] = _url;
        vanityURLUpdatedAt[tokenId][_aliasName] = block.timestamp;

        // returns the exceeded payment
        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool success, ) = msg.sender.call{value: excess}("");
            require(success, "cannot refund excess");
        }

        emit NewURLSet(msg.sender, _name, _aliasName, _url);
    }

    function deleteURL(string calldata _name, string calldata _aliasName)
        external
        whenNotPaused
        onlyD1DCV2NameOwner(_name)
    {
        bytes32 tokenId = keccak256(bytes(_name));
        string memory url = vanityURLs[tokenId][_aliasName];
        require(checkURLValidity(_name, _aliasName), "VanityURL: invalid URL");

        emit URLDeleted(msg.sender, _name, _aliasName, url);

        // delete the URL
        vanityURLs[tokenId][_aliasName] = "";
        vanityURLUpdatedAt[tokenId][_aliasName] = block.timestamp;
    }

    function updateURL(
        string calldata _name,
        string calldata _aliasName,
        string calldata _url
    ) external whenNotPaused onlyD1DCV2NameOwner(_name) {
        require(bytes(_url).length <= 1024, "VanityURL: url too long");
        
        bytes32 tokenId = keccak256(bytes(_name));
        require(checkURLValidity(_name, _aliasName), "VanityURL: invalid URL");

        emit URLUpdated(
            msg.sender,
            _name,
            _aliasName,
            vanityURLs[tokenId][_aliasName],
            _url
        );

        // update the URL
        vanityURLs[tokenId][_aliasName] = _url;
        vanityURLUpdatedAt[tokenId][_aliasName] = block.timestamp;
    }

    function getURL(string calldata _name, string calldata _aliasName)
        external
        view
        returns (string memory)
    {
        bytes32 tokenId = keccak256(bytes(_name));

        return vanityURLs[tokenId][_aliasName];
    }

    function checkURLValidity(string memory _name, string memory _aliasName)
        public
        view
        returns (bool)
    {
        bytes32 tokenId = keccak256(bytes(_name));
        return
            nameOwnerUpdateAt[tokenId] <=
                vanityURLUpdatedAt[tokenId][_aliasName]
                ? true
                : false;
    }

    function withdraw() external {
        require(
            msg.sender == owner() || msg.sender == revenueAccount,
            "D1DC: must be owner or revenue account"
        );
        (bool success, ) = revenueAccount.call{value: address(this).balance}(
            ""
        );
        require(success, "D1DC: failed to withdraw");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
