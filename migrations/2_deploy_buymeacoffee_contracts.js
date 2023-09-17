
const {deployProxy, upgradeProxy} = require('@openzeppelin/truffle-upgrades');

const BuyMeACoffee = artifacts.require("BuyMeACoffee");

module.exports = async function (deployer) {
    const instance = await deployProxy(BuyMeACoffee,[], {deployer});
};
