// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Counter
 * @dev A simple counter contract for demonstration purposes
 */
contract Counter {
    uint256 public number;

    event NumberSet(uint256 newNumber);
    event NumberIncremented(uint256 newNumber);

    function setNumber(uint256 newNumber) public {
        number = newNumber;
        emit NumberSet(newNumber);
    }

    function increment() public {
        number++;
        emit NumberIncremented(number);
    }
}
