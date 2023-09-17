// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Dev only
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract BuyMeACoffee is Initializable  {

    // Define a variable called 'name' to store the name of the smart contact
    string public name;
    // Mark the owner address as payable so we can send them Ether
    address payable public owner;
    // Define a variable to track the number of coffees given
    uint256 public coffeeCount;
    // Define a mapping of `uint256` to `Coffee` structs
    mapping(uint256 => Coffee) coffees;

    // Define a struct that will store info about each coffee.
    struct Coffee {
        uint256 id;
        address giver;
        uint256 timestamp;
        string message;
        string name;
        uint256 amount;
    }

    // Define an event that will be emitted when a coffee is given
    event CoffeeGiven(
        uint256 indexed id,
        address giver,
        uint256 timestamp,
        string message,
        string name,
        uint256 amount
    );

    //Define an event that will be emitted when a coffee is withdrawn
    event Withdrawn(
        address indexed from,
        address indexed to,
        uint256 amount
    );

    // Native constructor is replaced by initialize function in upgradeable contracts
    // @see https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable
    //constructor() {
    //    name = "Buy Me A Coffee";
    //    owner = payable(msg.sender);
    //}

    function initialize() public initializer {
        name = "Buy Me A Coffee";
        coffeeCount = 0;
        owner = payable(msg.sender);
    }

    // Define a function 'giveCoffee' that allows a user to give a coffee to the owner
    function giveCoffee(string memory _message, string memory _name, uint256 _amount) public payable {
        // Make sure the giver isn't the owner
        require(msg.sender != owner, "##The sender should not be the owner"); // this test or the one below
        // Make sure the message is not empty
        require(bytes(_message).length > 0, "##The message should not be empty");
        // Make sure the name is not empty
        require(bytes(_name).length > 0, "##The name should not be empty");
        // Make sure the coffee is paid for
        require(msg.value > 0, "##The amount should be greater than zero");
        // Make sure the sender balance is greater than the amount
        require(msg.sender.balance >= msg.value, "##The sender balance should be greater than the amount");
        // Increment the coffee count
        coffeeCount ++;
        // Create the coffee
        coffees[coffeeCount] = Coffee(coffeeCount, msg.sender, block.timestamp, _message, _name, _amount);
        // Trigger the event
        emit CoffeeGiven(coffeeCount, msg.sender, block.timestamp, _message, _name, _amount);
    }

    // Define a function 'withdrawAll' that allows the owner to withdraw all the Ether in the contract
    function withdrawAll() external payable {
        // Make sure the sender is the owner
        require(msg.sender == owner, "##Only the owner can withdraw funds");
        // Send all the Ether in the contract to the owner
        owner.transfer(address(this).balance);
        // Emit the Withdrawal event
        emit Withdrawn(msg.sender, owner, address(this).balance);
    }

    // list Coffee from coffees mapping by index and limit
    function listCoffees(uint256 index, uint256 limit) external view returns (Coffee[] memory) {
        // Make sure the index is greater than zero
        require(index > 0, "##The index should be greater than zero");
        // Make sure the index is less than or equal to the coffee count
        require(index <= coffeeCount, "##The index should be less than or equal to the coffee count");
        // Make sure the limit is greater than zero
        require(limit > 0, "##The limit should be greater than zero");
        // Make sure the index is less than or equal to the coffee count
        require(index <= coffeeCount, "##The index should be less than or equal to the coffee count");
        // Make sure the limit + index is less than or equal to the coffee count
        if (limit + index > coffeeCount) {
            limit = coffeeCount ;
        }
        // Create a new array of Coffee structs
        Coffee[] memory _coffees = new Coffee[](limit - index + 1);
        // Loop through the coffees
        for (uint256 i = index; i <= limit; i++) {
            // Get the coffee at the current index
            Coffee memory coffee = coffees[i];
            // Create a new coffee struct with only the specified attributes
            Coffee memory newCoffee;
            newCoffee.id = coffee.id;
            newCoffee.name = coffee.name;
            newCoffee.message = coffee.message;
            newCoffee.timestamp = coffee.timestamp;
            newCoffee.amount = coffee.amount;
            // Add the new coffee to the array
            _coffees[i-index] = newCoffee;
        }
        // Return the array
        return _coffees;
    }

    // Get the balance of the contract
    function getBalance() external view returns (uint256) {
        // This function reads the balance of the contract
        return address(this).balance;
    }
}