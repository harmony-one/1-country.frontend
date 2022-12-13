// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

/**
    @title A subdomain manager contract for .1.country (D1DC - Dot 1 Dot Country)
    @author John Whitton (github.com/johnwhitton), reviewed and revised by Aaron Li (github.com/polymorpher)
    @notice This contract allows the rental of domains under .1.country (”D1DC”)
    like “The Million Dollar Homepage”: Anyone can take over a domain name by 
    browsing to a web2 address like foo.1.country and doubling its last price.
    Currently, a payer owns the domain only for `rentalPeriod`, and is allowed to embed a tweet for the web page.
    D1DC creates ERC721 tokens for each domain registration.
 */
contract D1DCV2 is ERC721Upgradeable, PausableUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    bool public nameInitialized;
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

    struct OwnerInfo {
        string telegram;
        string email;
        string phone;
    }

    // Enum representing the emoji reactions
    enum EmojiType {
        ONE_ABOVE,
        FIRST_PRIZE,
        ONE_HUNDRED_PERCENT
    }

    /// @dev TokenId -> NameRecord
    mapping(bytes32 => NameRecord) public nameRecords;

    /// @dev TokenId -> OwnerInfo
    mapping(bytes32 => OwnerInfo) internal _ownerInfos;

    /// @dev Emoji Type -> Price
    mapping(EmojiType => uint256) public emojiReactionPrices;

    /// @dev TokenId -> Emoji Type -> Counter
    mapping(bytes32 => mapping(EmojiType => uint256)) public emojiReactionCounters;

    /// @dev User -> Name -> Timestamp got the reval permission
    mapping(address => mapping(bytes32 => uint256)) internal _telegramRevealAt;

    /// @dev User -> Name -> Timestamp got the reval permission
    mapping(address => mapping(bytes32 => uint256)) internal _emailRevealAt;

    /// @dev User -> Name -> Timestamp got the reval permission
    mapping(address => mapping(bytes32 => uint256)) internal _phoneRevealAt;

    /// @dev TokenId -> Timestamp the telegram info was updated
    mapping(bytes32 => uint256) internal _telegramUpdateAt;

    /// @dev TokenId -> Timestamp the email info was updated
    mapping(bytes32 => uint256) internal _emailUpdateAt;

    /// @dev TokenId -> Timestamp the phone info was updated
    mapping(bytes32 => uint256) internal _phoneUpdateAt;

    /// @dev Name rented lastly
    string public lastRented;

    /// @dev Name created lastly
    string public lastCreated;

    /// @dev TokenId list
    bytes32[] public keys;

    /// @dev Price for the url update
    uint256 public urlUpdatePrice;

    /// @dev Price for the telegram reveal
    uint256 public telegramRevealPrice;

    /// @dev Price for the email reveal
    uint256 public emailRevealPrice;

    /// @dev Price for the phone reveal
    uint256 public phoneRevealPrice;

    /// @dev TokenId -> Owner list
    mapping(bytes32 => address[]) public ownersOfName;

    event NameRented(string indexed name, address indexed renter, uint256 price, string url);
    event URLUpdated(string indexed name, address indexed renter, string oldUrl, string newUrl);
    event RevenueAccountChanged(address from, address to);
    event EmojiReactionAdded(address indexed by, string indexed name, EmojiType indexed emoji);

    //TODO create the EREC721 token at time of construction
    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _baseRentalPrice,
        uint32 _rentalPeriod,
        uint32 _priceMultiplier,
        address _revenueAccount,
        uint256 _telegramRevealPrice,
        uint256 _emailRevealPrice,
        uint256 _phoneRevealPrice
    ) external initializer {
        __ERC721_init(_name, _symbol);
        __Pausable_init();
        __Ownable_init();
        __ReentrancyGuard_init();

        baseRentalPrice = _baseRentalPrice;
        rentalPeriod = _rentalPeriod;
        priceMultiplier = _priceMultiplier;
        revenueAccount = _revenueAccount;
        telegramRevealPrice = _telegramRevealPrice;
        emailRevealPrice = _emailRevealPrice;
        phoneRevealPrice = _phoneRevealPrice;
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

    function setEmojiPrice(EmojiType _emojiType, uint256 _emojiPrice) public onlyOwner {
        emojiReactionPrices[_emojiType] = _emojiPrice;
    }

    function setTelegramPrice(uint256 _telegramRevealPrice) external onlyOwner {
        telegramRevealPrice = _telegramRevealPrice;
    }

    function setEmailPrice(uint256 _emailRevealPrice) external onlyOwner {
        emailRevealPrice = _emailRevealPrice;
    }

    function setPhonePrice(uint256 _phoneRevealPrice) external onlyOwner {
        phoneRevealPrice = _phoneRevealPrice;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function initializeNames(string[] calldata _names, NameRecord[] calldata _records) external onlyOwner {
        require(!nameInitialized, "D1DC: already initialized");
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

    function finishNameInitialization() external onlyOwner {
        nameInitialized = true;
    }

    // User functions

    function getPrice(bytes32 encodedName) public view returns (uint256) {
        NameRecord storage nameRecord = nameRecords[encodedName];
        if (nameRecord.timeUpdated + rentalPeriod <= uint32(block.timestamp)) {
            return baseRentalPrice;
        }
        return nameRecord.renter == msg.sender ? nameRecord.lastPrice : nameRecord.lastPrice * priceMultiplier;
    }

    function rent(string calldata name, string calldata url, string memory telegram, string memory email, string memory phone) public payable nonReentrant whenNotPaused {
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
            // pay 90% to the original name owner
            uint256 priceForOwner = price * 90 / 100;
            (bool success,) = originalOwner.call{value : priceForOwner}("");
            require(success, "error sending ether");
        } else {
            nameRecords[keccak256(bytes(lastCreated))].next = name;
            nameRecord.prev = lastCreated;
            lastCreated = name;
            _safeMint(msg.sender, tokenId);
        }

        // since _afterTokenTransfer function removes the owner info, add it after transferring NFT
        OwnerInfo storage ownerInfo = _ownerInfos[bytes32(tokenId)];
        ownerInfo.telegram = telegram;
        ownerInfo.email = email;
        ownerInfo.phone = phone;

        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool success,) = msg.sender.call{value : excess}("");
            require(success, "cannot refund excess");
        }
        emit NameRented(name, msg.sender, price, url);
    }

    function updateURL(string calldata name, string calldata url) public payable nonReentrant whenNotPaused {
        require(nameRecords[keccak256(bytes(name))].renter == msg.sender, "D1DC: not owner");
        require(bytes(url).length <= 1024, "D1DC: url too long");
        emit URLUpdated(name, msg.sender, nameRecords[keccak256(bytes(name))].url, url);
        nameRecords[keccak256(bytes(name))].url = url;

        // handle the payment
        uint256 price = urlUpdatePrice;
        require(price <= msg.value, "D1DC: insufficient url payment");
        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool success,) = msg.sender.call{value : excess}("");
            require(success, "cannot refund excess");
        }
    }

    function addEmojiReaction(string memory name, EmojiType emojiType) external payable nonReentrant whenNotPaused {
        // add the emoji reaction
        ++emojiReactionCounters[keccak256(bytes(name))][emojiType];

        // handle the payment
        uint256 price = emojiReactionPrices[emojiType];
        require(price <= msg.value, "D1DC: insufficient emoji payment");

        address owner = nameRecords[keccak256(bytes(name))].renter;
        // pay 90% to the name owner
        uint256 priceForOwner = price * 90 / 100;
        (bool success,) = owner.call{value : priceForOwner}("");
        require(success, "error sending ether");

        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool success,) = msg.sender.call{value : excess}("");
            require(success, "cannot refund excess");
        }

        emit EmojiReactionAdded(msg.sender, name, emojiType);
    }

    function addOwnerInfo(string memory name, string memory telegram, string memory email, string memory phone) external payable nonReentrant whenNotPaused {
        bytes32 tokenId = keccak256(bytes(name));
        uint256 price = msg.value;

        if (bytes(telegram).length != 0) {
            require(telegramRevealPrice <= price, "D1DC: insufficient personal info payment");
            price -= telegramRevealPrice;
            _ownerInfos[tokenId].telegram = telegram;
            _telegramRevealAt[msg.sender][tokenId] = block.timestamp;
        }

        if (bytes(email).length != 0) {
            require(emailRevealPrice <= price, "D1DC: insufficient personal info payment");
            price -= emailRevealPrice;
            _ownerInfos[tokenId].email = email;
            _emailRevealAt[msg.sender][tokenId] = block.timestamp;
        }

        if (bytes(phone).length != 0) {
            require(phoneRevealPrice <= price, "D1DC: insufficient personal info payment");
            price -= emailRevealPrice;
            _ownerInfos[tokenId].email = email;
            _phoneRevealAt[msg.sender][tokenId] = block.timestamp;
        }

        if (price > 0) {
            (bool success,) = msg.sender.call{value : price}("");
            require(success, "cannot refund excess");
        }
    }

    function requestTelegramReveal(string calldata name) external payable nonReentrant whenNotPaused {
        uint256 price = telegramRevealPrice;
        require(price <= msg.value, "D1DC: insufficient telegram payment");

        bytes32 tokenId = keccak256(bytes(name));
        address owner = nameRecords[tokenId].renter;
        require(owner != msg.sender, "D1DC: self reveal for telegram");
        if (_telegramRevealAt[msg.sender][tokenId] <= _telegramUpdateAt[tokenId]) {
            _telegramRevealAt[msg.sender][tokenId] =block.timestamp;
            (bool success,) = owner.call{value : price}("");
            require(success, "error sending ether");

            // returns the exceeded payment
            uint256 excess = msg.value - price;
            if (excess > 0) {
                (bool success,) = msg.sender.call{value : excess}("");
                require(success, "cannot refund excess");
            }
        } else {
            // since the requester already has the permission, returns the all payment
            uint256 excess = msg.value;
            if (excess > 0) {
                (bool success,) = msg.sender.call{value : excess}("");
                require(success, "cannot refund excess");
            }
        }
    }

    function requestEmailReveal(string calldata name) external payable nonReentrant whenNotPaused {
        uint256 price = emailRevealPrice;
        require(price <= msg.value, "D1DC: insufficient email payment");

        bytes32 tokenId = keccak256(bytes(name));
        address owner = nameRecords[tokenId].renter;
        require(owner != msg.sender, "D1DC: self reveal for email");
        if (_emailRevealAt[msg.sender][tokenId] <= _emailUpdateAt[tokenId]) {
            _emailRevealAt[msg.sender][tokenId] = block.timestamp;
            (bool success,) = owner.call{value : price}("");
            require(success, "error sending ether");

            // returns the exceeded payment
            uint256 excess = msg.value - price;
            if (excess > 0) {
                (bool success,) = msg.sender.call{value : excess}("");
                require(success, "cannot refund excess");
            }
        } else {
            // since the requester already has the permission, returns the all payment
            uint256 excess = msg.value;
            if (excess > 0) {
                (bool success,) = msg.sender.call{value : excess}("");
                require(success, "cannot refund excess");
            }
        }
    }

    function requestPhoneReveal(string calldata name) external payable nonReentrant whenNotPaused {
        uint256 price = phoneRevealPrice;
        require(price <= msg.value, "D1DC: insufficient phone payment");

        bytes32 tokenId = keccak256(bytes(name));
        address owner = nameRecords[tokenId].renter;
        require(owner != msg.sender, "D1DC: self reveal for phone");
        if (_phoneRevealAt[msg.sender][tokenId] <= _phoneUpdateAt[tokenId]) {
            _phoneRevealAt[msg.sender][tokenId] = block.timestamp;
            (bool success,) = owner.call{value : price}("");
            require(success, "error sending ether");

            // returns the exceeded payment
            uint256 excess = msg.value - price;
            if (excess > 0) {
                (bool success,) = msg.sender.call{value : excess}("");
                require(success, "cannot refund excess");
            }
        } else {
            // since the requester already has the permission, returns the all payment
            uint256 excess = msg.value;
            if (excess > 0) {
                (bool success,) = msg.sender.call{value : excess}("");
                require(success, "cannot refund excess");
            }
        }
        
    }

    function getOwnerTelegram(string calldata name) external returns (string memory) {
        address owner = nameRecords[keccak256(bytes(name))].renter;
        bytes32 tokenId = keccak256(bytes(name));
        if (msg.sender != owner) {
            require(_telegramUpdateAt[tokenId] < _telegramRevealAt[msg.sender][tokenId], "D1DC: no permission for telegram reveal");
        }

        return _ownerInfos[tokenId].telegram;
    }

    function getOwnerEmail(string calldata name) external returns (string memory) {
        address owner = nameRecords[keccak256(bytes(name))].renter;
        bytes32 tokenId = keccak256(bytes(name));
        if (msg.sender != owner) {
            require(_emailUpdateAt[tokenId] < _emailRevealAt[msg.sender][tokenId], "D1DC: no permission for email reveal");
        }

        return _ownerInfos[tokenId].email;
    }

    function getOwnerPhone(string calldata name) external returns (string memory) {
        address owner = nameRecords[keccak256(bytes(name))].renter;
        bytes32 tokenId = keccak256(bytes(name));
        if (msg.sender != owner) {
            require(_phoneUpdateAt[tokenId] < _phoneRevealAt[msg.sender][tokenId], "D1DC: no permission for phone reveal");
        }

        return _ownerInfos[tokenId].phone;
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override virtual {
        bytes32 tokenId = bytes32(firstTokenId);
        NameRecord storage nameRecord = nameRecords[tokenId];
        nameRecord.renter = to;
        
        // reset the owner info
        OwnerInfo storage ownerInfo = _ownerInfos[tokenId];
        ownerInfo.telegram = "";
        ownerInfo.email = "";
        ownerInfo.phone = "";

        // update the owner update timestamp
        _telegramUpdateAt[tokenId] = block.timestamp;
        _emailUpdateAt[tokenId] = block.timestamp;
        _phoneUpdateAt[tokenId] = block.timestamp;

        // update the owner list
        ownersOfName[tokenId].push(to);
    }

    function withdraw() external {
        require(msg.sender == owner() || msg.sender == revenueAccount, "D1DC: must be owner or revenue account");
        (bool success,) = revenueAccount.call{value : address(this).balance}("");
        require(success, "D1DC: failed to withdraw");
    }
}
