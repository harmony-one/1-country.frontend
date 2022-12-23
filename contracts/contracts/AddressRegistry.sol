// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract AddressRegistry is OwnableUpgradeable {
    /// @dev D1DCV2 contract address
    address public d1dcV2;

    /// @dev VanityURL contract address
    address public vanityURL;

    event D1DCV2Updated(address indexed oldD1DCV2, address indexed newD1DCV2);
    event VanityURLUpdated(
        address indexed oldVanityURL,
        address indexed newVanityURL
    );

    function initialize() external initializer {
        __Ownable_init();
    }

    function setD1DCV2(address _d1dcV2) external onlyOwner {
        require(_d1dcV2 != address(0), "Zero address");

        emit D1DCV2Updated(d1dcV2, _d1dcV2);
        d1dcV2 = _d1dcV2;
    }

    function setVanityURL(address _vanityURL) external onlyOwner {
        require(_vanityURL != address(0), "Zero address");

        emit VanityURLUpdated(vanityURL, _vanityURL);
        vanityURL = _vanityURL;
    }
}
