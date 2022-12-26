// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

interface IAddressRegistry {
    function d1dcV2() external view returns (address);

    function vanityURL() external view returns (address);
}
