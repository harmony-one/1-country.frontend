// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

interface ID1DCV2 {
    function nameRecords(bytes32 tokenId)
        external
        view
        returns (
            address renter,
            uint32 timeUpdated,
            uint256 lastPrice,
            string memory url,
            string memory prev,
            string memory next
        );
}
