'use client'

import {useState, useEffect, ChangeEvent, FormEvent} from 'react';
import {ethers, ContractInterface} from "ethers";
import {
    AppNavbar,
    Card,
    ConfirmToast,
    Container,
    SelectItem,
    PrimaryButton,
    ProfileCard,
    NewTabLink,
    Input,
    TextArea,
    WithdrawButton
} from "@/app/buymeacoffee/components";
import {
    mapResultsFromTx,
    profile,
    getError, TransactionResult, Donor, getNetwork, NetworkMap
} from '@/lib';
import {IconLoader2} from '@tabler/icons';
import {motion} from "framer-motion"
import toast from 'react-hot-toast';
import abi from "@/abis/BuyMeACoffeeV2.json"
import Image from 'next/image'
import {
    ConnectorData,
    useAccount,
    useWalletClient,
} from 'wagmi'
import {
    getContract,
    getAccount,
    watchContractEvent,
    getNetwork as viemGetNetwork,
    GetAccountResult,
    GetNetworkResult,
    Address,
    GetContractResult,
} from '@wagmi/core'
import {parseEther, createWalletClient, custom, Transport, Abi, WatchContractEventOnLogsParameter} from "viem";

type EthereumProvider = { request(...args: any): Promise<any> }

const coffeesLimit: number = Number(process.env.NEXT_PUBLIC_COFFEES_LISTING_LIMIT);
const etherUnit: number = Number(process.env.NEXT_PUBLIC_ETHER_UNIT);
const contractABI: ContractInterface = abi.abi;

export default function PageContent() {

    // wagmi hooks
    const {
        address,
        connector,
        isDisconnected,
        isConnected
    } = useAccount();
    const {data: walletClient, isError, isLoading} = useWalletClient();
    const [mounted, setMounted] = useState<boolean>(false); // looks unused but do not remove it !
    const [donors, setDonors] = useState<Donor[]>([]);
    const [donorsCount, setDonorsCount] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [amount, setAmount] = useState<number>(3);
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [account, setAccount] = useState<string>();
    const [network, setNetwork] = useState<NetworkMap | null>(null);
    const [contract, setContract] = useState<GetContractResult | null>(null);
    const [owner, setOwner] = useState<string | null>();
    const [rawBalance, setRawBalance] = useState<bigint | null>();
    const [balance, setBalance] = useState<number | null>();
    const [events, setEvents] = useState<any>({});

    /**
     * Update the contract and network state
     * Set a standalone wallet client that will be used to interact with the contract and could be
     * updated when the user changes the network or change the account
     */
    const updateContract = async () => {
        await setContract(null);
        await setNetwork(null);
        const account: GetAccountResult = await getAccount();
        const viemNetwork: GetNetworkResult = await viemGetNetwork();
        const wallet = createWalletClient({
            account: account.address as Address,
            chain: viemNetwork?.chain,
            transport: custom(window.ethereum as EthereumProvider) as Transport
        })
        const network:NetworkMap = getNetwork(viemNetwork.chain);
        const contract: GetContractResult = getContract({
            address: network.contractAddress as Address,
            abi: contractABI as Abi,
            walletClient: wallet
        });
        const owner: string = (await contract.read.owner()) as string;
        await setOwner(owner);
        setNetwork(network);
        setContract(contract);
    };

    /**
     * Connect wallet
     * - This method will be called when the user clicks on the connect wallet button, or when the network
     * is changed via updating the chainId state
     * - We use web3Modal to connect to the user's wallet
     * - We use ethers.js to get the signer and the provider
     */
    const connectWallet = async () => {
        try {
            setAccount(address);
            subscribeToEvents();
            listCoffees();
            refreshBalance();
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * Reset state of the account, chainId and network and clear the session storage
     */
    const refreshState = () => {
        setContract(null);
        setAccount('');
        setNetwork(null);
        setOwner(null);
        setRawBalance(null);
        setBalance(null);
        setDonors([]);
        setDonorsCount(0);
    };

    /**
     * Disconnect wallet
     * - This method will be called when the user clicks on the disconnect button to clear the cached provider
     * - We use web3Modal to clear the cached provider
     * - We call the refreshState method to reset the account, chainId and network state
     * - We call the unsubscribeFromEvents method to unsubscribe from the contract events
     */
    const disconnect = async () => {
        refreshState();
    };

    /**
     * Handle account and chain update
     * @param account
     * @param chain
     */
    const handleConnectorUpdate = async ({account, chain}: ConnectorData) => {
        if (account) {
            setAccount(account);
        } else if (chain) {
            await updateContract();
        }
    };

    // const handleMessageChange = e => setMessage(emojiStrip(e.target.value));
    const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value);
    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => setName(e.target.value);
    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => setAmount(Math.floor(Number(e.target.value)));

    /**
     * Refresh the balance of the contract
     */
    const refreshBalance = async () => {
        // cancel if no contract is set
        if (!contract) return;
        const rawBalance: bigint = await contract.read.getBalance() as bigint;
        const balance: number = Number(ethers.utils.formatEther(rawBalance));
        setRawBalance(rawBalance);
        setBalance(balance);
    };

    /**
     * Withdraw all the funds from the contract to the owner address
     */
    const withdraw = async () => {
        // cancel if no contract is set
        if (!contract) return;
        // cancel if no account is not connected
        if (!account) return;
        // cancel if account is the owner
        if (!(account === owner)) return;
        // withdraw all and show a toast messages on success
        try {
            // this is a limitation in the current version of the library
            // @ts-ignore
            await contract.write.withdrawAll();
            toast.success('Withdraw success');
        } catch (error) {
            const [_code, _message] = getError(error);
            toast.error(`${_code}: ${_message}`);
            console.error("SM.Error:", _message, _code);
        }
    };

    /**
     * Sending a coffee donation with a message and name
     * - This method submits a transaction to the contract address with a contract call 'buy-coffee'
     * - On call success we display a toast message and add the incoming transaction to our existing list of transactions
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // cancel if no contract is set
        if (!contract) return;
        // cancel if no account is not connected
        if (!account) return;
        setLoading(true);
        try {
            const account = await getAccount();
            const v = (etherUnit * amount).toString();
            const value = parseEther(v);
            const args = [message, name, amount];
            const opts = {
                value: value,
                account: account.address
            };
            // this is a limitation in the current version of the library
            // @ts-ignore
            const {estimate} = await contract.estimateGas.giveCoffee(args, opts)
            // this is a limitation in the current version of the library
            // @ts-ignore
            const {simulate} = await contract.simulate.giveCoffee(args, opts)
            // this is a limitation in the current version of the library
            // @ts-ignore
            const {hash} = await contract.write.giveCoffee(args, opts);
            toast.success('Thank you for the support! Your donation will be processed soon.');
            // clear the form values
            setMessage('');
            setName('');
            setAmount(3);
        } catch (error) {
            setLoading(false);
            const [_code, _message] = getError(error);
            toast.error(`${_code}: ${_message}`);
            // console.trace("SM.Error:", _message, _code);
        }
        setLoading(false);
    };

    /**
     * Fetching list of coffees
     */
    const listCoffees = async () => {
        // cancel if no contract is set
        if (!contract) return;
        const c: number = Number(await contract.read.coffeeCount());
        if (c > 0) {
            try {
                // get the last n coffees and reverse the array to get the latest coffee first
                let limit = coffeesLimit;
                const offset = c > limit ? c - limit + 1 : 1;
                const args = [offset, limit];
                const opts = {};
                // this is a limitation in the current version of the library
                // @ts-ignore
                const results: TransactionResult[] = await contract.read.listCoffees(args, opts);
                const donors: Donor[] = mapResultsFromTx(results);
                setDonorsCount(c);
                setDonors(donors);
            } catch (error) {
                console.log('@@@@ Vanilla Js Error: ',error);
                const [_code, _message] = getError(error);
                toast.error(`${_code}: ${_message}`);
                console.error("SM.Error:", _message, _code);
            }
        } else {
            setDonors([]);
            setDonorsCount(0);
        }
    };

    /**
     * Subscribe to events
     * - This method subscribes to the contract events and updates the donors list and balance on event
     */
    const subscribeToEvents = () => {
        // cancel if no contract is set
        if (!contract) return;
        const args = {
            address: contract.address as Address,
            abi: contractABI as Abi,
        };

        /////////////////////
        // CoffeeGiven event

        // unsubscribe from previous event
        if (events.coffeeGiven) {
            events.coffeeGiven.event();
        }
        const _cg = watchContractEvent({...args, ...{eventName: 'CoffeeGiven'}},
            (event: WatchContractEventOnLogsParameter) => {
                // map event results to a Donor object
                // @ts-ignore
                const args = event[0].args;
                const donor: Donor = mapResultsFromTx([{
                    id: args.id,
                    name: args.name,
                    message: args.message,
                    amount: args.amount,
                    timestamp: args.timestamp
                }])[0];
                // update the donors list
                setDonors(prevState => {
                    //Make sure the donor doesn't exist already in the list of donors
                    if (prevState.some(d => d.id === donor.id)) {
                        // duplicate detected, return the previous state
                        return prevState;
                    } else {
                        // add the new donor to the list
                        return [donor, ...prevState];
                    }
                });
                refreshBalance();
            }
        );
        events.coffeeGiven = {event: _cg};


        /////////////////////
        // Withdrawn event

        // unsubscribe from previous event
        if (events.Withdrawn) {
            events.Withdrawn.event();
        }
        const _w = watchContractEvent({...args, ...{eventName: 'Withdrawn'}},
            (event) => {
                refreshBalance();
            }
        );

        // Update the events list
        setEvents(events);
    };

    /**
     * Hook to update the contract and network state when the connector is updated
     */
    useEffect(() => {
        if (connector) {
            connector.on('change', handleConnectorUpdate)
        }
        return () => {
            if (connector) {
                connector.off('change', handleConnectorUpdate)
            }
        }
    }, [connector])

    /**
     * Initialize web3Modal once the component is mounted
     * Set the mounted state to true once the component is mounted
     */
    useEffect(() => {
        if (typeof window !== "undefined") {
            setMounted(true)
        }
    }, []);

    /**
     * Connect wallet on page load or on chainId change (user connected to a different network)
     */
    useEffect(() => {
        (async () => {
            if (mounted && contract && address) {
                connectWallet();
            }
        })();
    }, [mounted, contract]);

    /**
     * Hook to update the contract when the user first connects to the app
     */
    useEffect(() => {
        (async () => {
            if (walletClient && isConnected === true && !contract) {
                await updateContract();
            }
        })();
    }, [isConnected, walletClient]);

    /**
     * Hook to clear all the state when the user disconnects
     */
    useEffect(() => {
        if (isDisconnected) {
            disconnect();
        }
    }, [isDisconnected]);

    return (
        <motion.div
            initial={{opacity: 0, scale: 1}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.5}}
        >
            <AppNavbar/>
            <Container>
                <div className="md:flex justify-center pt-8 max-w mb-8">
                    <div className="flex flex-col mx-auto mt-8">
                        <Image
                            src="images/Buy_Me_a_Coffee_Logo.png"
                            width={60}
                            height={30}
                            alt="Picture of the author"
                        />
                    </div>
                    <div className="mx-auto mt-4">
                        <div className="text-lg font-medium leading-6 text-gray-900 flex space-x-2">
                            <div>Hey there !</div>
                        </div>
                        <div className="mt-2 text-sm text-zinc-700 max-w-2xl">
                            This is a demo app on how to build a simple dapp with Solidity, Next.js
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
                </div>
                {(account && account === owner) ? (<div className="mx-auto mt-8">
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
                        {address && (donorsCount > 0) ?
                            (<Card>
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
                            </Card>) : (<></>)}
                    </div>

                    <div className="mt-4 sm:mt-0">
                        <Card>
                            <div className="p-8 items-center text-center mx-auto w-full">
                                <div className="flex justify-between">
                                    <div className="font-semibold text-lg mb-4 text-left">
                                        Buy <span className="font-bold text-orange-500">Me</span> a coffee
                                        with Ξ
                                    </div>
                                    {network ?
                                        (<div>
                                            <div
                                                className="ml-2 rounded-xl capitalize inline-flex border px-2 py-0.5 text-xs font-semibold text-zinc-500">
                                                {network?.type}
                                            </div>
                                        </div>) : (<></>)}
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
                                        <w3m-button/>
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
