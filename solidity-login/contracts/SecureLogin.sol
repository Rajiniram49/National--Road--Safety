// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract SecureLogin {
    struct User {
        bytes32 passwordHash;
        bool exists;
    }

    mapping(string => User) private users;

    event UserRegistered(string username);
    event LoginSuccessful(string username);
    event LoginFailed(string username);

    function register(string memory username, string memory password) public {
        require(!users[username].exists, "User already registered");
        users[username] = User({
            passwordHash: keccak256(abi.encodePacked(password)),
            exists: true
        });
        emit UserRegistered(username);
    }

    function login(string memory username, string memory password) public view returns (bool) {
        if (users[username].exists && users[username].passwordHash == keccak256(abi.encodePacked(password))) {
            emit LoginSuccessful(username);
            return true;
        } else {
            emit LoginFailed(username);
            return false;
        }
    }
}
