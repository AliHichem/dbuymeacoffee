'use client'

import {useState, useEffect} from 'react';
import {Contract, ethers, ContractInterface} from "ethers";

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
    getError, TransactionResult, Donor
} from '@/lib';

import {IconLoader2} from '@tabler/icons';
import {motion} from "framer-motion"
import toast from 'react-hot-toast';
import ConfirmToast from '@/components/ConfirmToast';
import Web3Modal from "web3modal";
import {providers} from "@/app/providers";
import AuthButton from "@/components/AuthButton";
import WithdrawButton from "@/components/WithdrawButton";
import abi from "@/abis/BuyMeACoffeeV2.json"
import {Network, Web3Provider} from "@ethersproject/providers";
import {JsonRpcSigner} from "@ethersproject/providers/src.ts";

const coffeesLimit: number = process.env.COFFEES_LISTING_LIMIT;
const etherUnit: string = process.env.ETHER_UNIT;
const contractAddress: string = process.env.CONTRACT_ADDRESS;
const contractABI: ContractInterface = abi.abi;

export default function Page() {

    const [mounted, setMounted] = useState<boolean>(false);
    const [donors, setDonors] = useState<Donor[]>([]);
    const [donorsCount, setDonorsCount] = useState<number>(null);
    const [name, setName] = useState<string>('');
    const [amount, setAmount] = useState<number>(3);
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    //#########################################################
    //############## handle wallet connect ####################
    //#########################################################

    let [account, setAccount] = useState<string>(null);
    const [provider, setProvider] = useState<any>(null);
    const [library, setLibrary] = useState<Web3Provider>();
    const [error, setError] = useState<string>(null);
    const [chainId, setChainId] = useState<number>();
    const [network, setNetwork] = useState<Network>();
    const [contract, setContract] = useState<Contract>(null);
    const [owner, setOwner] = useState<string>();
    const [rawBalance, setRawBalance] = useState<bigint>();
    const [balance, setBalance] = useState<number>();

    const connectWallet = async () => {
        try {
            account = sessionStorage.getItem('account');
            const provider: any = await web3Modal.connect();
            const library: Web3Provider = new ethers.providers.Web3Provider(provider);
            const accounts: string[] = await library.listAccounts();
            const network: Network = await library.getNetwork();
            const signer: JsonRpcSigner = library.getSigner();
            const contract: Contract = new ethers.Contract(contractAddress, contractABI, signer);
            const contractName: string = await contract.name();
            const owner: string = await contract.owner();
            setOwner(owner);
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
        setAccount(null);
        setChainId(null);
        setNetwork(null);
        sessionStorage.removeItem('account');
    };

    const disconnect = async () => {
        await web3Modal.clearCachedProvider();
        refreshState();
    };


    //#########################################################
    //###################### listeners ########################
    //#########################################################

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

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        (async () => {
            if (web3Modal.cachedProvider) {
                await connectWallet();
            }
        })();
    }, []);

    useEffect(() => {
        if (provider?.on) {

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

    const refreshBalance = async () => {
        const rawBalance: bigint = await contract.getBalance();
        const balance: number = Number(ethers.utils.formatEther(rawBalance));
        setRawBalance(rawBalance);
        setBalance(balance);
    };

    const withdraw = async () => {
        // cancel if no account is not connected
        if (!account) return;
        // cancel if account is the owner
        if (!(account === owner)) return;
        // withdraw all and show a toast messages on success
        try {
            await contract.withdrawAll();
            toast.success('Withdraw success');
        } catch (error) {
            const [_code, _message] = getError(error);
            toast.error(`${_code}: ${_message}`);
            console.error("SM.Error:", _message, _code);
        }
    };

    // Sending a coffee donation with a message and name
    // - This method submits a transaction to the contract address with a contract call 'buy-coffee'
    // - On call success we display a toast message and add the incoming transaction to our existing list of transactions
    const handleSubmit = async e => {
        e.preventDefault();
        if (!account) return;
        setLoading(true);
        try {
            console.log(message, name, amount, ethers.utils.parseEther(etherUnit) * amount);
            await contract.giveCoffee(message, name, amount, {
                // gasLimit: 21000,
                value: ethers.utils.parseEther(etherUnit) * amount,
            })
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
        setLoading(false);
    };

    // Fetching list of coffees
    const listCoffees = async () => {
        const c: number = Number(await contract.coffeeCount());
        if (c > 0) {
            try {
                // get the last n coffees and reverse the array to get the latest coffee first
                let limit = coffeesLimit;
                const offset = c > limit ? c - limit + 1 : 1;
                const results: TransactionResult[] = await contract.listCoffees(offset, limit);
                const donors: Donor[] = mapResultsFromTx(results);
                setDonorsCount(c);
                setDonors(donors);
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
            const donor: Donor = mapResultsFromTx([{
                id: id,
                name: name,
                message: message,
                amount: amount,
                timestamp: timestamp
            }])[0];

            setDonors(prevState => {
                return [donor, ...prevState];
            });

            refreshBalance();
        });

        contract.on('Withdrawn', (owner, to, amount) => {
            refreshBalance();
        });
    };

    // Fetching data on page load
    useEffect(() => {
        if (contract) {
            listCoffees();
            subscribeToEvents();
            refreshBalance();
        }

        return () => {
            if (contract) {
                contract.removeAllListeners();
            }
        };

    }, [contract]);

    return (
        <motion.div
            initial={{opacity: 0, scale: 1}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.5}}
        >
            <AppNavbar account={account} connectWallet={connectWallet} disconnect={disconnect}/>
            <Container>
                <div className="mx-auto mt-8">
                    <div className="text-lg font-medium leading-6 text-gray-900 flex space-x-2">
                        <div>Hey there !</div>
                    </div>
                    <div className="mt-2 text-sm text-zinc-700 max-w-2xl">
                        This is a demo app on how to build an simple dapp with Solidity, Next.js
                        and Ether.js. Feel free grab some testnet ETH from the {''}
                        <span className="text-orange-500 font-semibold hover:underline cursor-pointer">
          <NewTabLink href="https://sepoliafaucet.com/">
            SepoliaFaucet
          </NewTabLink>
        </span>{' '} to try out the app. Contracts are deployed on{' '}
                        <span className="text-orange-500 font-semibold hover:underline cursor-pointer">
          <NewTabLink
              href="https://sepoliafaucet.com/">
            Sepolia
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
                {(account == owner) ? (<div className="mx-auto mt-8">
                    <div className="mt-4 sm:mt-0">
                        <Card>
                            <div className="p-4 items-center text-center mx-auto w-full">
                                <div className="flex justify-between">
                                    <div className="font-semibold text-base text-zinc-900">
                                        Current Balance: <span
                                        className="font-bold text-orange-500">${balance} Ξ </span>
                                    </div>

                                    <div>
                                        <ConfirmToast
                                            asModal={true}
                                            childrenClassName='margin-top-1'
                                            customFunction={withdraw}
                                            message='Withdraw all your funds ?'
                                            showCloseIcon={false}
                                            theme='light'>
                                            <WithdrawButton/>
                                        </ConfirmToast>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>) : (<></>)}
                <div className="md:flex gap-4 justify-center pt-8 max-w mb-16">
                    <div className="flex flex-col gap-4">
                        <ProfileCard profile={profile}/>
                        <Card>
                            <div className="p-8">
                                <div className="font-semibold text-base text-zinc-800">
                                    Recent supporters {donorsCount && `(${donorsCount})`}
                                </div>
                                {donors?.map((donor) => (
                                    <div
                                        key={"donor-" + donor.id}
                                        className="flex border-b last:border-b-0 py-4 space-x-4 items-start"
                                    >
                                        <div className="text-4xl w-12 h-12 flex justify-center items-center">
                                            {([1, 3, 5].includes(donor.amount) && '☕️') || '🔥'}
                                        </div>
                                        <div className="w-full">
                                            <div className="flex items-center justify-between">
                                                <div className=" text-sm text-zinc-600">
                                                    <span
                                                        className="font-semibold">{donor?.name || 'Someone'}</span>{' '}
                                                    bought <span
                                                    className="font-semibold">{donor.amount}</span>{' '}
                                                    coffee(s)
                                                </div>
                                            </div>
                                            <div className="text-xs mt-1 text-zinc-600">
                                                {donor?.timestamp ? (
                                                    new Date(donor?.timestamp * 1000).toLocaleString()
                                                ) : (
                                                    <div className="text-orange-500">Transaction is pending</div>
                                                )}
                                            </div>
                                            {donor?.message && (
                                                <div
                                                    className="border mt-4 border-blue-300 rounded w-fit bg-blue-50 px-4 py-2 text-sm text-zinc-600 flex space-x-2">
                                                    <span className="text-lg">💬</span>
                                                    <span>{donor.message.toString()}</span>
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
                                        with Ξ
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
                                            <Input disabled={loading} type="number" value={amount}
                                                   onChange={handleAmountChange}/>
                                        </div>
                                    </div>

                                    <Input
                                        disabled={loading}
                                        value={name}
                                        onChange={handleNameChange}
                                        placeholder="Name or @twitter (optional)"
                                        label="Name"
                                    />
                                    <TextArea
                                        disabled={loading}
                                        value={message}
                                        rows={6}
                                        onChange={handleMessageChange}
                                        placeholder="Thank you for the support. Feel free to leave a comment below. It could be anything – appreciation, information or even humor ... (optional)"
                                        label="Message"
                                    />
                                    {account ? (
                                        <>
                                            <PrimaryButton disabled={loading} type="submit">Support
                                                with {amount}Ξ</PrimaryButton>
                                            {loading ? (<IconLoader2
                                                className="animate-spin inline-flex items-center px-1 py-1 text-xs space-x-2 font-medium transition rounded font-medium relative"/>) : (<></>)}
                                        </>
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
        </motion.div>
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