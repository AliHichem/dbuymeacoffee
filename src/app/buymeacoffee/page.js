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

import {useInterval} from '@/lib/useInterval';

import {
    userSession,
    truncateUrl,
    mapResultsFromTx,
    getNetworkConfig,
    appDetails,
    ONE_MILLION,
    profile,
    authenticate
} from '@/lib';
import {IconWallet} from "@tabler/icons";
import Web3Modal from "web3modal";
import {providers} from "@/app/providers";
import AuthButton from "@/components/AuthButton";

export default function Page() {

    const [mounted, setMounted] = useState(false);
    const [txs, setTxs] = useState([]);
    const [supporters, setSupporters] = useState(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState(3);
    const [message, setMessage] = useState('');
    // const [provider, setProvider] = useState(null);
    // const [network, setNetwork] = useState('');

    //#########################################################
    //############## handle wallet connect ####################
    //#########################################################

    const [provider, setProvider] = useState();
    const [library, setLibrary] = useState();
    const [account, setAccount] = useState();
    const [error, setError] = useState("");
    const [chainId, setChainId] = useState();
    const [network, setNetwork] = useState();
    const [verified, setVerified] = useState();
    const connectWallet = async () => {
        try {
            const account = sessionStorage.getItem('account');
            const provider = await web3Modal.connect();
            const library = new ethers.providers.Web3Provider(provider);
            const accounts = await library.listAccounts();
            const network = await library.getNetwork();
            setProvider(provider);
            setLibrary(library);
            if (accounts) {
                setAccount(accounts[0]);
                sessionStorage.setItem('account', account);
            }
            setChainId(network.chainId);
        } catch (error) {
            console.error(error);
            setError(error);
        }
    };

    const refreshState = () => {
        setAccount();
        setChainId();
        setNetwork("");
        setVerified(undefined);
        sessionStorage.removeItem('account');
    };

    const disconnect = async () => {
        await web3Modal.clearCachedProvider();
        refreshState();
    };

    useEffect(() => {
        if (web3Modal.cachedProvider) {
            connectWallet();
        }
    }, []);

    useEffect(() => {
        if (provider?.on) {
            const handleAccountsChanged = (accounts) => {
                console.log("accountsChanged", accounts);
                if (accounts) setAccount(accounts[0]);
            };

            const handleChainChanged = (_hexChainId) => {
                console.log("chainChanged", _hexChainId);
                setChainId(_hexChainId);
            };

            const handleDisconnect = () => {
                console.log("disconnect", error);
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

    useEffect(() => setMounted(true), []);

    const handleMessageChange = e => setMessage(emojiStrip(e.target.value));
    const handleNameChange = e => setName(e.target.value);
    const handlePriceChange = e => setPrice(Math.floor(e.target.value));

    // Sending a coffee donation with a message and name
    // - This method submits a transaction to the contract address with a contract call 'buy-coffee'
    // - We make the call using `openContractCall` function from `@stacks/connect`
    // - On call success we display a toast message and add the incoming transaction to our existing list of transactions
    const handleSubmit = async e => {
        e.preventDefault();
        if(!account) return;

        // FunctionArgs
        // - args that we pass to the smart contract - message, name and price.
        const functionArgs = [
            stringUtf8CV(message),
            stringUtf8CV(name),
            uintCV(price * ONE_MILLION)
        ];

        // PostCondition is a safety feature of the clarity smart contracts
        // - To learn more I recommend this article by Kenny Rogers - https://dev.to/stacks/understanding-stacks-post-conditions-e65

        const postConditionAddress = userSession.loadUserData().profile.stxAddress.testnet;
        const postConditionCode = FungibleConditionCode.LessEqual;
        const postConditionAmount = price * ONE_MILLION;

        const postConditions = [
            makeStandardSTXPostCondition(
                postConditionAddress,
                postConditionCode,
                postConditionAmount
            )
        ];

        const options = {
            contractAddress,
            contractName: 'coffee',
            functionName: 'buy-coffee',
            functionArgs,
            network,
            postConditions,
            appDetails,
            onFinish: data => {
                toast.success('Thank you for a coffee');
                setTxs([
                    {
                        id: data.txId,
                        timestamp: null,
                        sender: null,
                        name,
                        amount: price,
                        message,
                        txStatus: 'pending'
                    },
                    ...txs
                ]);
            }
        };

        await openContractCall(options);
    };

    // Fetching list of messages
    // - This method fetches the transactions from the contract address.
    // - You can find a full API documentation here: https://docs.hiro.so/api#tag/Accounts/operation/get_account_transactions
    // - The `mapResultsFromTx` method is used to map the raw transaction data to the data we need.
    // - The `setTxs` method is used to update the state with the new data.
    const listCoffees = async () => {
        // https://docs.hiro.so/api#tag/Accounts/operation/get_account_transactions
        console.log('fetching transactions ...');
        const res = await fetch(
            `${network.coreApiUrl}/extended/v1/address/${contractAddress}.coffee/transactions`
        );
        const result = await res.json();

        console.log('results:', result.results);

        const mappedTxs = mapResultsFromTx(result.results);
        setTxs(mappedTxs);
    };

    // Fetching number of supporters
    // - This method fetches the number of supporters from the contract address.
    // - We parse the response to get the number of supporters.
    const getSupporterCounter = async () => {
        const userAddress = userSession.loadUserData().profile.stxAddress.testnet;

        const counter = await callReadOnlyFunction({
            contractAddress,
            contractName: 'coffee',
            functionName: 'get-index',
            network,
            functionArgs: [],
            senderAddress: userAddress
        });

        const parsedValue = parseInt(counter?.value?.value);
        setSupporters(parsedValue);
    };


    // useEffect(() => {
    //     const initializeProvider = async () => {
    //         if (window.ethereum) {
    //             await window.ethereum.request({method: 'eth_requestAccounts'});
    //             const provider = new ethers.providers.Web3Provider(window.ethereum);
    //             console.log('provider', provider);
    //             setProvider(provider);
    //         }
    //     };
    //
    //     initializeProvider();
    //     const getNetwork = async () => {
    //         if (provider) {
    //             const network = await provider.getNetwork();
    //             setNetwork(network.name);
    //         }
    //     };
    //
    //     getNetwork();
    // }, [provider]);


    // // Fetching data on page load
    // useEffect(() => {
    //     listCoffees();
    //     if (userSession.isUserSignedIn()) {
    //         getSupporterCounter();
    //     }
    // }, []);

    // // Fetching data every 60 seconds
    // useInterval(() => {
    //     console.log('>>>>>>>>>> getting messages');
    //     listCoffees();
    //     if (userSession.isUserSignedIn()) {
    //         getSupporterCounter();
    //     }
    // }, 5 * 1000);


    // export const Conditional = ({ condition, childrenTrue, childrenFalse }) => {
    //     if (condition) {
    //         return <>(childrenTrue)</>;
    //     } else {
    //         return <>(childrenFalse)</>;
    //     }
    // };

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
                                {txs?.map(tx => (
                                    <div
                                        key={tx.id}
                                        className="flex border-b last:border-b-0 py-4 space-x-4 items-start"
                                    >
                                        <div className="text-4xl w-12 h-12 flex justify-center items-center">
                                            {([1, 3, 5].includes(tx.amount) && '☕️') || '🔥'}
                                        </div>
                                        <div className="w-full">
                                            <div className="flex items-center justify-between">
                                                <div className=" text-sm text-zinc-600">
                                                    <span className="font-semibold">{tx?.name || 'Someone'}</span>{' '}
                                                    bought <span className="font-semibold">{tx.amount}</span>{' '}
                                                    coffee(s)
                                                </div>
                                                <NewTabLink
                                                    href={`${explorerUrl}/txid/${tx.id}`}
                                                    className={`text-xs hover:underline cursor-pointer ${
                                                        tx.txStatus === 'pending'
                                                            ? 'text-orange-500'
                                                            : 'text-zinc-600'
                                                    }`}
                                                >
                                                    {tx.txStatus === 'success' ? '🚀' : '⌛'} {truncateUrl(tx.id)}
                                                </NewTabLink>
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
                                                    <span className="text-lg">💬</span> <span>{tx.message}</span>
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
                                            {process.env.NEXT_PUBLIC_NETWORK || 'devnet'}
                                        </div>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-2">
                                    <div
                                        className="flex space-x-4   items-center bg-orange-50 border-blue-200 border rounded p-4">
                                        <div className="text-4xl">☕️</div>
                                        <div className="text-xl text-orange-500 font-bold">x</div>

                                        <SelectItem setPrice={setPrice} price={price} currentValue={1}/>
                                        <SelectItem setPrice={setPrice} price={price} currentValue={3}/>
                                        <SelectItem setPrice={setPrice} price={price} currentValue={5}/>

                                        <div className="w-10">
                                            <Input type="number" value={price} onChange={handlePriceChange}/>
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
                                        <PrimaryButton type="submit">Support with Ӿ{price}</PrimaryButton>
                                    ) : (
                                        <AuthButton account={account} connectWallet={connectWallet} disconnect={disconnect}/>
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