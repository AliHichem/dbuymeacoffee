
const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const BuyMeACoffee = artifacts.require('BuyMeACoffee');
const BuyMeACoffeeV2 = artifacts.require('BuyMeACoffeeV2');

module.exports = async function (deployer) {
    const existing = await BuyMeACoffee.deployed();
    const instance = await upgradeProxy(existing.address, BuyMeACoffeeV2, { deployer , kind: 'uups'});
    console.log(`################### Deployed proxy on ${instance.address}`);
};