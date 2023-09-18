const {deployProxy} = require('@openzeppelin/truffle-upgrades');

require('chai')
    .use(require('chai-as-promised'))
    .should()

// Load compiled artifacts
const BuyMeACoffee = artifacts.require('BuyMeACoffee');

// Start test block
contract('BuyMeACoffee (proxy)', function ([deployer, firstGiver, secondGiver]) {

    let buyMeACoffee;

    // Deploy a new BuyMeACoffee contract for each test
    beforeEach(async function () {
        buyMeACoffee = await deployProxy(BuyMeACoffee, [], {from: deployer, kind: 'uups'});
    });

    describe('proxy first implementation', function () {
        it('check if the proxy is initialized correctly', async function () {
            const name = await buyMeACoffee.name();
            const coffeeCount = await buyMeACoffee.coffeeCount();
            const owner = await buyMeACoffee.owner();
            assert.notEqual(name, 'BuyMeACoffee', 'The proxy is not initialized correctly');
            assert.equal(coffeeCount, 0, 'The proxy is not initialized correctly');
            assert.equal(owner, deployer, 'The proxy is not initialized correctly');
        });
    });

    // describe('proxy upgrade', function () {
    //     it('check if upgrade to v2 works correctly', async function () {
    //         const contract = await upgradeProxy(buyMeACoffee.address, BuyMeACoffeeV2);
    //         assert.equal(contract.address, buyMeACoffee.address, 'The proxy is not upgraded correctly');
    //     });
    //
    //     it('check if the proxy is accessing the new v2 implementation', async function () {
    //         const contract = await upgradeProxy(buyMeACoffee.address, BuyMeACoffeeV2);
    //         const v2Funtion = await contract.v2Function();
    //         assert.equal(v2Funtion, 'This is a V2 function', 'The proxy is not accessing the new v2 implementation');
    //     });
    // });

});