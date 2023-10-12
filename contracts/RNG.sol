// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * RNG Endpoint Code for Function getRandomBytes() is taken from the SKALE Network Documentation here: https://docs.skale.network/tools/skale-specific/random-number-generator
 */
contract RNG {

    /**
     * @dev Read here for how it works: https://docs.skale.network/tools/skale-specific/random-number-generator
     */
    function getRandomBytes() public view returns (bytes32 addr) {
        assembly {
            let freemem := mload(0x40)
            let start_addr := add(freemem, 0)
            if iszero(staticcall(gas(), 0x18, 0, 0, start_addr, 32)) {
              invalid()
            }
            addr := mload(freemem)
        }
    }
    
    /**
     * @return The randon number
     */
	function getRandomNumber() public view returns (uint256) {
		return uint256(getRandomBytes());
	}
    
    /**
     * @param nextIndex The nextIndex to interate the RNG value by
     * @return The randon number with an additional index iteration. This shold be used for multiple values in the same block
     */
	function getNextRandomNumber(uint256 nextIndex) public view returns (uint256) {
		return uint256(keccak256(abi.encode(getRandomNumber() | nextIndex)));
	}


    /**
     * @param nextIndex The nextIndex to interate the RNG value by
     * @param max The maximum number the random number should be inclusive
     * @return Random number between 0 & max
     */
	function getNextRandomRange(uint256 nextIndex, uint256 max) public view returns (uint256) {
		return uint256(keccak256(abi.encode(getRandomNumber() | nextIndex))) % max;
	}
    
    /**
     * @param max The maximum number the random number should be inclusive
     * @return Random number between 0 & max
     */
	function getRandomRange(uint256 max) public view returns (uint256) {
		return getRandomNumber() % max;
	}
}
