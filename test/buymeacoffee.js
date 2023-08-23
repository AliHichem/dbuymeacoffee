const BuyMeACoffee = artifacts.require('./BuyMeACoffee.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('BuyMeACoffee', ([deployer, firstGiver, secondGiver]) => {

    let buyMeACoffee;

    before(async () => {
        buyMeACoffee = await BuyMeACoffee.new({ from: deployer })
        const contractAddress = buyMeACoffee.address;
    })

    describe('deployment', async () => {

        it('deploys successfully', async () => {
            const address = await buyMeACoffee.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        });

        it('should set the owner address correctly', async () => {
            const owner = await buyMeACoffee.owner()
            assert.equal(owner, deployer)
        });

        it('has a name', async () => {
            // const name = await debug(buyMeACoffee.name())
            const name = await buyMeACoffee.name()
            assert.equal(name, 'Buy Me A Coffee')
        });

    });

    describe('givers', async () => {

        it('should increment the coffee count correctly', async () => {
            await buyMeACoffee.giveCoffee('Test message', 'Test name', 1, {from: firstGiver, value: web3.utils.toWei('1', 'Ether')});
            const coffeeCount = await buyMeACoffee.coffeeCount();
            assert.equal(coffeeCount, 1);
        });

        it('should send the coffee to the owner correctly', async () => {
            const owner = await buyMeACoffee.owner();
            // reset the balance
            await buyMeACoffee.withdrawAll({from: owner});
            const oldBalance = Number(await web3.eth.getBalance(owner) / 10**18);
            await buyMeACoffee.giveCoffee('Test message', 'Test name', 1, {from: firstGiver, value: web3.utils.toWei('1', 'Ether') });
            await buyMeACoffee.withdrawAll({from: owner});
            const newBalance = Number(await web3.eth.getBalance(owner) / 10**18);
            expect(newBalance).to.be.greaterThan(0);
            expect(newBalance).to.be.greaterThan(oldBalance);
        });

        it('should emit the event correctly', async () => {
            await buyMeACoffee.giveCoffee('Test message', 'Test name', 1, {from: firstGiver, value: web3.utils.toWei('1', 'Ether') });
            const events = await buyMeACoffee.getPastEvents('CoffeeGiven');
            expect(events.length).to.equal(1);
        });

        it('should log the transaction to the Coffee struct', async () => {
            await buyMeACoffee.giveCoffee('Test message', 'Test name', 1, {from: firstGiver, value: web3.utils.toWei('1', 'Ether') });
            const coffee = await buyMeACoffee.coffees(1);
            expect(coffee.message).to.equal('Test message');
            expect(coffee.name).to.equal('Test name');
            expect(coffee.amount).to.equal('1000000000000000000');
        });

    });
});
