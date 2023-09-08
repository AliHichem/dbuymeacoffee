'use client'

import {useState, useEffect} from 'react';
import {ethers} from "ethers";

import AppNavbar from '@/components/AppNavbar';
import Container from '@/components/Container';
import {Input, TextArea} from '@/components/Form';
import NewTabLink from '@/components/NewTabLink';
import ProfileCard from '@/components/ProfileCard';
import {PrimaryButton} from '@/components/Button';
import Card from '@/components/Card';

import {
    mapResultsFromTx,
    profile,
    getError
} from '@/lib';

import toast from 'react-hot-toast';
import Web3Modal from "web3modal";
import {providers} from "@/app/providers";
import AuthButton from "@/components/AuthButton";
import abi from "@/abis/BuyMeACoffee.json"

const coffeesLimit = process.env.COFFEES_LISTING_LIMIT;
const etherUnit = process.env.ETHER_UNIT;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = abi.abi;

export default function Page() {

    const [txs, setTxs] = useState([]);
    const [supporters, setSupporters] = useState(null);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState(3);
    const [message, setMessage] = useState('');

    //#########################################################
    //############## handle wallet connect ####################
    //#########################################################

    let [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [library, setLibrary] = useState();
    const [network, setNetwork] = useState();
    const [chainId, setChainId] = useState();
    const [error, setError] = useState("");

    const connectWallet = async () => {
        try {
            account = sessionStorage.getItem('account');
            const provider = await web3Modal.connect();
            const library = new ethers.providers.Web3Provider(provider);
            const accounts = await library.listAccounts();
            const network = await library.getNetwork();
            const signer = library.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            setContract(contract);
            setProvider(provider);
            setLibrary(library);
            if (accounts) {
                setAccount(accounts[0]);
                sessionStorage.setItem('account', account);
            }
            setChainId(network.chainId);
        } catch (error) {
            console.error(error);
        }
    };

    const refreshState = () => {
        setAccount();
        setChainId();
        setNetwork("");
        sessionStorage.removeItem('account');
    };

    const disconnect = async () => {
        await web3Modal.clearCachedProvider();
        refreshState();
    };

    useEffect(() => {
        (async () => {
            if (web3Modal.cachedProvider) {
                await connectWallet();
            }
        })();
    }, []);

    useEffect(() => {
        if (provider?.on) {
            const handleAccountsChanged = (accounts) => {
                console.info("accountsChanged", accounts);
                if (accounts) setAccount(accounts[0]);
            };

            const handleChainChanged = (_hexChainId) => {
                console.info("chainChanged", _hexChainId);
                setChainId(_hexChainId);
            };

            const handleDisconnect = () => {
                console.info("disconnect", error);
                disconnect();
            };

            provider.on("accountsChanged", handleAccountsChanged);
            provider.on("chainChanged", handleChainChanged);
            provider.on("disconnect", handleDisconnect);

            return () => {
                if (provider.removeListener) {
                    provider.removeListener("accountsChanged", handleAccountsChanged);
                    provider.removeListener("chainChanged", handleChainChanged);
                    provider.removeListener("disconnect", handleDisconnect);
                }
            };
        }
    }, [provider]);

    const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions: providers, // required
        theme: "dark"
    });

    //#########################################################
    //############## handle coffees donations #################
    //#########################################################

    // const handleMessageChange = e => setMessage(emojiStrip(e.target.value));
    const handleMessageChange = e => setMessage(e.target.value);
    const handleNameChange = e => setName(e.target.value);
    const handleAmountChange = e => setAmount(Math.floor(e.target.value));

    // Sending a coffee donation with a message and name
    // - This method submits a transaction to the contract address with a contract call 'buy-coffee'
    // - On call success we display a toast message and add the incoming transaction to our existing list of transactions
    const handleSubmit = async e => {
        e.preventDefault();
        if (!account) return;
        try {
            const result = await contract.giveCoffee(message, name, amount, {
                // gasLimit: 21000,
                value: ethers.utils.parseEther(etherUnit) * amount,
            });
            toast.success('Thank you for the support! Your donation will be processed soon.');
            // clear the form values
            setMessage('');
            setName('');
            setAmount(3);
        } catch (error) {
            const [_code, _message] = getError(error);
            toast.error(`${_code}: ${_message}`);
            console.error("SM.Error:", _message, _code);
        }
    };

    // Fetching list of coffees
    const listCoffees = async () => {

        const c = Number(await contract.coffeeCount());
        if (c > 0) {
            try {
                // get the last n coffees and reverse the array to get the latest coffee first
                let limit = coffeesLimit;
                const offset = c > limit ? c - limit + 1 : 1;
                const donors = await contract.listCoffees(offset, limit);
                const results = mapResultsFromTx(donors);
                setSupporters(c);
                setTxs(results);
            } catch (error) {
                const [_code, _message] = getError(error);
                toast.error(`${_code}: ${_message}`);
                console.error("SM.Error:", _message, _code);
            }
        }
    };

    const subscribeToEvents = async () => {
        contract.on('CoffeeGiven', (id, giver, timestamp, message, name, amount) => {
            // add a new donor to donors list
            const donor = mapResultsFromTx([{
                id: id,
                name: name,
                message: message,
                amount: amount,
                timestamp: timestamp
            }])[0];

            setTxs(prevState => {
                return [
                    donor,
                    ...prevState
                ];
            });
        });
    };

    // Fetching data on page load
    useEffect(() => {
        if (contract) {
            listCoffees();
            subscribeToEvents();
        }

        return () => {
            if (contract) {
                contract.removeAllListeners();
            }
        };

    }, [contract]);

    return (
        <>
            <AppNavbar account={account} connectWallet={connectWallet} disconnect={disconnect}/>
            <Container>
                <div className="mx-auto mt-8">
                    <div className="text-lg font-medium leading-6 text-gray-900 flex space-x-2">
                        <div>Hey there !</div>
                    </div>
                    <div className="mt-2 text-sm text-zinc-700 max-w-2xl">
                        This is a demo app on how to build an simple dapp with Solidity smart contracts
                        and Web3.js. Feel free grab some testnet STX from the {''}
                        <span className="text-orange-500 font-semibold hover:underline cursor-pointer">
          <NewTabLink href="https://explorer.stacks.co/sandbox/deploy?chain=testnet">
            Faucet
          </NewTabLink>
        </span>{' '} to try out the app. Contracts are deployed on{' '}
                        <span className="text-orange-500 font-semibold hover:underline cursor-pointer">
          <NewTabLink
              href="https://explorer.stacks.co/txid/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.coffee?chain=testnet">
            Testnet
          </NewTabLink>
        </span>
                        . You can find a source code on{' '}
                        <span className="text-gray-800 font-semibold hover:underline cursor-pointer">
          <NewTabLink href="https://github.com/AliHichem">
            Github
          </NewTabLink>
        </span>
                    </div>
                </div>
                <div className="md:flex gap-4 justify-center pt-8 max-w mb-16">
                    <div className="flex flex-col gap-4">
                        <ProfileCard profile={profile}/>
                        <Card>
                            <div className="p-8">
                                <div className="font-semibold text-base text-zinc-800">
                                    Recent supporters {supporters && `(${supporters})`}
                                </div>
                                {txs?.map((tx) => (
                                    <div
                                        key={"donor-" + tx.id}
                                        className="flex border-b last:border-b-0 py-4 space-x-4 items-start"
                                    >
                                        <div className="text-4xl w-12 h-12 flex justify-center items-center">
                                            {([1, 3, 5].includes(tx.amount) && '☕️') || '🔥'}
                                        </div>
                                        <div className="w-full">
                                            <div className="flex items-center justify-between">
                                                <div className=" text-sm text-zinc-600">
                                                    <span className="font-semibold">{tx?.name || 'Someone'}</span>{' '}
                                                    bought <span
                                                    className="font-semibold">{tx.amount}</span>{' '}
                                                    coffee(s)
                                                </div>
                                            </div>
                                            <div className="text-xs mt-1 text-zinc-600">
                                                {tx?.timestamp ? (
                                                    new Date(tx?.timestamp * 1000).toLocaleString()
                                                ) : (
                                                    <div className="text-orange-500">Transaction is pending</div>
                                                )}
                                            </div>
                                            {tx?.message && (
                                                <div
                                                    className="border mt-4 border-blue-300 rounded w-fit bg-blue-50 px-4 py-2 text-sm text-zinc-600 flex space-x-2">
                                                    <span className="text-lg">💬</span>
                                                    <span>{tx.message.toString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="mt-4 sm:mt-0">
                        <Card>
                            <div className="p-8 items-center text-center mx-auto w-full">
                                <div className="flex justify-between">
                                    <div className="font-semibold text-lg mb-4 text-left">
                                        Buy <span className="font-bold text-orange-500">Me</span> a coffee
                                        with Ӿ
                                    </div>

                                    <div>
                                        <div
                                            className="ml-2 rounded-xl capitalize inline-flex border px-2 py-0.5 text-xs font-semibold text-zinc-500">
                                            {network || 'devnet'}
                                        </div>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-2">
                                    <div
                                        className="flex space-x-4   items-center bg-orange-50 border-blue-200 border rounded p-4">
                                        <div className="text-4xl">☕️</div>
                                        <div className="text-xl text-orange-500 font-bold">x</div>

                                        <SelectItem setPrice={setAmount} price={amount} currentValue={1}/>
                                        <SelectItem setPrice={setAmount} price={amount} currentValue={3}/>
                                        <SelectItem setPrice={setAmount} price={amount} currentValue={5}/>

                                        <div className="w-10">
                                            <Input type="number" value={amount} onChange={handleAmountChange}/>
                                        </div>
                                    </div>

                                    <Input
                                        value={name}
                                        onChange={handleNameChange}
                                        placeholder="Name or @twitter (optional)"
                                        label="Name"
                                    />
                                    <TextArea
                                        value={message}
                                        rows={6}
                                        onChange={handleMessageChange}
                                        placeholder="Thank you for the support. Feel free to leave a comment below. It could be anything – appreciation, information or even humor ... (optional)"
                                        label="Message"
                                    />
                                    {account ? (
                                        <PrimaryButton type="submit">Support with Ӿ{amount}</PrimaryButton>
                                    ) : (
                                        <AuthButton account={account} connectWallet={connectWallet}
                                                    disconnect={disconnect}/>
                                    )}
                                </form>
                            </div>
                        </Card>
                    </div>
                </div>
            </Container>
        </>
    );
}

const SelectItem = ({price, currentValue, setPrice}) => (
    <div
        className={`font-semibold  flex items-center border justify-center w-8 h-8 rounded-full cursor-pointer ${
            price == currentValue
                ? 'bg-orange-500 text-white'
                : 'text-orange-500 bg-white border-blue-100'
        }`}
        onClick={() => setPrice(currentValue)}
    >
        {currentValue}
    </div>
);