const BuyMeACoffee = artifacts.require("BuyMeACoffee");

module.exports = function(deployer) {
  const contract = deployer.deploy(BuyMeACoffee);

//   // Get the contract address
//   const contractAddress = contract.address;
//
// // Send 1 Ether to the contract
//   web3.eth.sendTransaction({
//     from: accounts[0],
//     to: contractAddress,
//     value: 1**18
//   });

};
