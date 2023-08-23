// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Dev only
import "@openzeppelin/contracts/utils/Strings.sol";

contract BuyMeACoffee {

    // Define a variable called 'name' to store the name of the smart contact
    string public name;
    // Mark the owner address as payable so we can send them Ether
    address payable public owner;
    // Define a variable to track the number of coffees given
    uint256 public coffeeCount = 0;

    // Define an array of `Coffee` structs
    Coffee[] coffees;

    // Define a struct that will store info about each coffee.
    struct Coffee {
        address giver;
        uint256 timestamp;
        string message;
        string name;
        uint256 amount;
    }

    // Define an event that will be emitted when a coffee is given
    event CoffeeGiven(
        address indexed giver,
        uint256 timestamp,
        string message,
        string name,
        uint256 amount
    );

    constructor() {
        name = "Buy Me A Coffee";
        owner = payable(msg.sender);
    }

    // Define a function 'giveCoffee' that allows a user to give a coffee to the owner
    function giveCoffee(string memory _message, string memory _name, uint256 _amount) public payable {
        // Make sure the giver isn't the owner
        require(msg.sender != owner, "The sender should not be the owner"); // this test or the one below
        // Make sure the message is not empty
        require(bytes(_message).length > 0, "The message should not be empty");
        // Make sure the name is not empty
        require(bytes(_name).length > 0, "The name should not be empty");
        // Make sure the coffee is paid for
        require(msg.value > 0, "The amount should be greater than zero");
        // Make sure the sender balance is greater than the amount
        require(msg.sender.balance >= msg.value, "The sender balance should be greater than the amount");
        // Increment the coffee count
        coffeeCount ++;
        // Create the coffee
        coffees.push(Coffee(msg.sender, block.timestamp, _message, _name, _amount));
        //// Save the money in the contract (no code needed here)
        //(bool success,) = owner.call{value: msg.value}("");
        //require(success, "Failed to send money");

        // Trigger the event
        emit CoffeeGiven(msg.sender, block.timestamp, _message, _name, _amount);
    }

    // Define a function 'withdrawAll' that allows the owner to withdraw all the Ether in the contract
    function withdrawAll() public payable {
        // Make sure the sender is the owner
        require(msg.sender == owner, "The sender should be the owner");
        // Send all the Ether in the contract to the owner
        (bool success,) = owner.call{value: address(this).balance}("");
        require(success, "Failed to withdraw the money");
    }
}