const {deployProxy, upgradeProxy} = require('@openzeppelin/truffle-upgrades');

require('chai')
    .use(require('chai-as-promised'))
    .should()

// Load compiled artifacts
const BuyMeACoffee = artifacts.require('BuyMeACoffee');
const BuyMeACoffeeV2 = artifacts.require('BuyMeACoffeeV2');

// Start test block
contract('BuyMeACoffeeV2 (proxy)', function ([deployer, firstGiver, secondGiver]) {

    let buyMeACoffee;

    // Deploy a new BuyMeACoffee contract for each test
    beforeEach(async function () {
        buyMeACoffee = await deployProxy(BuyMeACoffee, [], {from: deployer, kind: 'uups'});
    });

    describe('proxy upgrade', function () {
        it('check if upgrade to v2 works correctly', async function () {
            const contract = await upgradeProxy(buyMeACoffee.address, BuyMeACoffeeV2, {kind: 'uups'});
            assert.equal(contract.address, buyMeACoffee.address, 'The proxy is not upgraded correctly');
        });
    });

});