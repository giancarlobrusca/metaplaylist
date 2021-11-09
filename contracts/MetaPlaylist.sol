// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract MetaPlaylist {
    uint256 totalWaves;
    uint256 private seed;

    event NewSong(address indexed from, uint256 timestamp, string uri);

    struct Song {
        address waver;
        string uri;
        uint256 timestamp;
    }

    Song[] songs;

    // mapping(address => uint256) public songsAdded;

    constructor() payable {
        seed = (block.timestamp + block.difficulty) % 100;
    }

    function addSong(string memory _uri) public {
        // require(
        //     songsAdded[msg.sender] == 0,
        //     "You can only add one song to the playlist"
        // );

        // songsAdded[msg.sender] = 1;
        
        songs.push(Song(msg.sender, _uri, block.timestamp));

        seed = (block.difficulty + block.timestamp + seed) % 100;

        if (seed <= 50) {
            console.log("%s won!", msg.sender);

        uint256 prizeAmount = 0.0001 ether;
        require(
            prizeAmount <= address(this).balance,
             "Trying to withdraw more money than the contract has."
        );

        (bool success, ) = (msg.sender).call{value: prizeAmount}("");
        require(success, "Failed to withdraw money from contract.");
        }

        emit NewSong(msg.sender, block.timestamp, _uri);
    }

    function getAllSongs() public view returns (Song[] memory) {
        return songs;
    }
}