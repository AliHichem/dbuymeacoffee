![alt text](https://upload.wikimedia.org/wikipedia/en/5/5c/Buy_Me_a_Coffee_Logo.png)
# Decentrelized "Buy me a coffee" app on the Ethereum blockchain.



This is a simple decentralized app (Dapp) that allows you to receive donations in Ether (ETH) on the Ethereum blockchain. 
It is based on:
- The [Truffle](https://www.trufflesuite.com/) framework for developing, testing and deploying smart contracts.
- [NextJs](https://nextjs.org/) for the frontend.
- Smart contracts are written in [Solidity](https://solidity.readthedocs.io/en/v0.6.12/).
- [OpenZeppelin](https://openzeppelin.com/) for the smart contract library.
- [Python3](https://www.python.org/downloads/) for the stream backend used to send email notifications.
- [Ganache](https://www.trufflesuite.com/ganache) for the local blockchain.
- [Mortalis](https://moralis.io/) for the backend.
- [ngrok](https://ngrok.com/) for the tunneling (dev only).
- [Metamask](https://metamask.io/) for the wallet.
- [Web3modal](https://docs.walletconnect.com/web3modal/about) v3 for the interaction with the smart contract.
- [Etherscan](https://etherscan.io/) for the smart contract verification.

## System requirements

- Install: 
  * [Truffle v5.9](https://www.trufflesuite.com/truffle) 
  * [Ganache v7.8](https://www.trufflesuite.com/ganache)
  * [Node.js v18.16](https://nodejs.org/en/)
  * [Yarn v3.5](https://yarnpkg.com/) (included with Node.js)
  * [Ngrok](https://ngrok.com/)
  * [Python3](https://www.python.org/downloads/)
  * [Metamask](https://metamask.io/) (browser extension)
  
## Setup smart contract 

- Start ganache (needed as for a local blockchain): I use Ganache GUI but you can also use ganache-cli ( not covered here).
- Run :
  * `truffle compile`
  * `truffle test` (optional)

#### (Deploy the smart contract to the local blockchain)
  * `truffle migrate` 
#### (Deploy the smart contract to sepolia testnet)
I like to use [Truffle Dashboard](https://trufflesuite.com/docs/truffle/how-to/use-the-truffle-dashboard/) and avoid having to use infura directly.
  * `truffle run dashboard` (this will open the truffle dashboard in your browser)
  * Select the Sepolia testnet in your metamask wallet
  * `truffle migrate --network dashboard`

## Setup frontend

- `yarn install`
- `yarn run dev` (to start the dev server)
- `yarn build` (to build the app, export is automated)'

## Mortalis  Streams backend    
In order to get email notification you should have your smart contract events sent to a backend. I use [Mortalis](https://moralis.io/) for this.
#### (Register to moralis)
- Go to [Moralis](https://moralis.io/) and register for a free account.
- Create a new project.
- Create a new Stream and set your smart contract address in it: your smart contract have to be deployed in a public network (testnet or mainnet) in order for moralis to be able to read the events.
- In the Stream settings, set the webhook url to your deployed python3 backend (look below for dev) and the method to `POST`.
#### (python3 streasm backend for dev)
- `cd streams`
- `python3 -m venv venv`
- `source venv/bin/activate`
- `pip install -r requirements.txt`
- `python3 backend.py`
- In a new terminal: `ngrok http 5000` (this will create a tunnel to your localhost:3000).
- From Ngrok, copy the url and set it as the webhook url in moralis.

## Deployment

- SmartContract: @see above the truffle dashboard section.
- Frontend: I use github actions to push nextjs front, @see .github/workflows/nextjs.yml
- Streams backend: I use github actions to deploy to AWS Lambda using Serverless framework, @see .github/workflows/streams.yml

Almost everything is automated and could be deployed for free (yes github pages and aws lambda are free under certain limit) except if you deploy your smart contract to the mainnet, in this case you will have to pay for the gas fees.