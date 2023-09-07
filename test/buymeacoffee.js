const BuyMeACoffee = artifacts.require('./BuyMeACoffee.sol')

const utils = require("./helpers/utils");
const time = require("./helpers/time");

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('BuyMeACoffee', ([deployer, firstGiver, secondGiver]) => {

    let buyMeACoffee;

    before(async () => {
        buyMeACoffee = await BuyMeACoffee.new({from: deployer})
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
            await buyMeACoffee.giveCoffee('Test message', 'Test name', 1, {
                from: firstGiver,
                value: web3.utils.toWei('0.01', 'Ether')
            });
            const coffeeCount = await buyMeACoffee.coffeeCount();
            assert.equal(coffeeCount, 1);
        });

        it('should send the coffee to the owner correctly', async () => {
            const owner = await buyMeACoffee.owner();
            // reset the balance
            await buyMeACoffee.withdrawAll({from: owner});
            const oldBalance = Number(await web3.eth.getBalance(owner) / 10 ** 18);
            await buyMeACoffee.giveCoffee('Test message', 'Test name', 1, {
                from: firstGiver,
                value: web3.utils.toWei('0.01', 'Ether')
            });
            await buyMeACoffee.withdrawAll({from: owner});
            const newBalance = Number(await web3.eth.getBalance(owner) / 10 ** 18);
            expect(newBalance).to.be.greaterThan(0);
            expect(newBalance).to.be.greaterThan(oldBalance);
        });

        it('should emit the event correctly', async () => {
            await buyMeACoffee.giveCoffee('Test message', 'Test name', 1, {
                from: firstGiver,
                value: web3.utils.toWei('0.01', 'Ether')
            });
            const events = await buyMeACoffee.getPastEvents('CoffeeGiven');
            expect(events.length).to.equal(1);
        });

    });

    describe('listing the givers', async () => {

        it("should not allow if the index is greater than the coffee count", async function () {
            let message = "The index should be less than or equal to the coffee count";
            let err = await utils.shouldThrow(buyMeACoffee.listCoffees(10, 1));
            expect(err.message.includes(message));
        });

        it("should not allow if the index is lte to zero", async function () {
            let message = "The index should be greater than zero";
            let err = await utils.shouldThrow(buyMeACoffee.listCoffees(0, 1));
            expect(err.message.includes(message));
        });

        it("should not allow if the limit is lte to zero", async function () {
            let message = "The limit should be greater than zero";
            let err = await utils.shouldThrow(buyMeACoffee.listCoffees(1, 0));
            expect(err.message.includes(message));
        });

        it("should not allow if the index is lte to the coffee count", async function () {
            let message = "The index should be less than or equal to the coffee count";
            await buyMeACoffee.giveCoffee("Test message", "Test name", 10, {
                from: firstGiver,
                value: web3.utils.toWei('0.01', 'Ether')
            });
            let err = await utils.shouldThrow(buyMeACoffee.listCoffees(11, 1));
            expect(err.message.includes(message));
        });

        const giveRandomCoffee = (message, name, amount, giver) => {
            // set default random giver between firstGiver and secondGiver
            if (typeof giver === 'undefined') giver = Math.random() >= 0.5 ? firstGiver : secondGiver;
            // set default random message
            if (typeof message === 'undefined') message = "Test message";
            // set default random amount from 1 to 5
            if (typeof amount === 'undefined') amount = Math.floor(Math.random() * 5) + 1;
            // set default random name
            if (typeof name === 'undefined') name = "Test name";

            return buyMeACoffee.giveCoffee(message, name, amount, {
                from: giver,
                value: web3.utils.toWei('0.01', 'Ether') * amount
            });
        };

        it("should return an array of Coffee struct listing the name, message, amount and timestamp", async function () {

            // renew the contract
            buyMeACoffee = await BuyMeACoffee.new({from: deployer})

            await giveRandomCoffee("Test message", "Test name", 1, firstGiver);
            await giveRandomCoffee("Test message 2", "Test name 2", 2, secondGiver);
            await giveRandomCoffee("Test message 3", "Test name 3", 3, firstGiver);

            const coffees = await buyMeACoffee.listCoffees(1, 10);
            expect(coffees.length).to.equal(3);
            // expect coffee not to have a "giver" property
            expect(coffees[0].id).to.equal('1');
            expect(coffees[0].giver).to.equal('0x0000000000000000000000000000000000000000');
            expect(coffees[0].message).to.equal("Test message");
            expect(coffees[0].name).to.equal("Test name");
            expect(coffees[0].amount).to.equal("1");
            expect(Number(coffees[0].timestamp)).to.be.greaterThan(0);
            expect(coffees[1].giver).to.equal('0x0000000000000000000000000000000000000000');
            expect(coffees[1].message).to.equal("Test message 2");
            expect(coffees[1].name).to.equal("Test name 2");
            expect(coffees[1].amount).to.equal("2");
            expect(Number(coffees[1].timestamp)).to.be.greaterThan(0);
            expect(coffees[2].id).to.equal('3');
            expect(coffees[2].giver).to.equal('0x0000000000000000000000000000000000000000');
            expect(coffees[2].message).to.equal("Test message 3");
            expect(coffees[2].name).to.equal("Test name 3");
            expect(coffees[2].amount).to.equal("3");
            expect(Number(coffees[2].timestamp)).to.be.greaterThan(0);
        });

        it("should return an array of Coffee struct that matches the given offset and limit", async function () {

            // renew the contract
            buyMeACoffee = await BuyMeACoffee.new({from: deployer})

            // create 13 random coffees
            for (let i = 0; i < 13; i++) {
                await giveRandomCoffee();
            }
            const count = await buyMeACoffee.coffeeCount();
            expect(count.toString()).to.equal('13');

            // get the last 6 coffees
            const coffees0 = await buyMeACoffee.listCoffees(8, 6);
            expect(coffees0.length).to.equal(6);
            expect(coffees0[0].id).to.equal('8');
            expect(coffees0[1].id).to.equal('9');
            expect(coffees0[2].id).to.equal('10');
            expect(coffees0[3].id).to.equal('11');
            expect(coffees0[4].id).to.equal('12');
            expect(coffees0[5].id).to.equal('13');

            // get the last 8 coffees
            const coffees = await buyMeACoffee.listCoffees(6, 8);
            expect(coffees.length).to.equal(8);
            expect(coffees[0].id).to.equal('6');
            expect(coffees[1].id).to.equal('7');
            expect(coffees[2].id).to.equal('8');
            expect(coffees[3].id).to.equal('9');
            expect(coffees[4].id).to.equal('10');
            expect(coffees[5].id).to.equal('11');
            expect(coffees[6].id).to.equal('12');
            expect(coffees[7].id).to.equal('13');

            // get the last 10 coffees
            const coffees2 = await buyMeACoffee.listCoffees(4, 10);
            expect(coffees2.length).to.equal(10);
            expect(coffees2[0].id).to.equal('4');
            expect(coffees2[1].id).to.equal('5');
            expect(coffees2[2].id).to.equal('6');
            expect(coffees2[3].id).to.equal('7');
            expect(coffees2[4].id).to.equal('8');
            expect(coffees2[5].id).to.equal('9');
            expect(coffees2[6].id).to.equal('10');
            expect(coffees2[7].id).to.equal('11');
            expect(coffees2[8].id).to.equal('12');
            expect(coffees2[9].id).to.equal('13');

        });
    });
});
