'use client'

import {createWeb3Modal, defaultWagmiConfig} from '@web3modal/wagmi/react'
import {WagmiConfig} from 'wagmi'
import {sepolia, mainnet, localhost, Chain} from 'wagmi/chains'
import {useState} from "react";
import PageContent from "./_content";

const projectId = '119731842fced63569edee9c2ea8e54b'
const metadata = {
    name: 'My Website',
    description: 'My Website description',
    url: 'https://alihichem.github.io/',
    icons: ['https://avatars.mywebsite.com/']
}

let chains: Chain[] = [];
// check for supported chains from NEXT_PUBLIC_SUPPORTED_CHAINS
// @ts-ignore
const supportedChains: string[] = process.env.NEXT_PUBLIC_SUPPORTED_CHAINS.split(',').map(chain => chain.trim());

if(supportedChains.indexOf('localhost') !== -1) chains.push(localhost);
if(supportedChains.indexOf('sepolia') !== -1) chains.push(sepolia);
if(supportedChains.indexOf('mainnet') !== -1) chains.push(mainnet);

const wagmiConfig = defaultWagmiConfig({chains, projectId, metadata})

createWeb3Modal({
    wagmiConfig, projectId, chains,
    themeVariables: {
        "--w3m-accent": "rgb(234 88 12)",
        "--w3m-font-size-master": ".5rem",
        "--w3m-border-radius-master": "1px",
    }
})

export default function Page() {
    const [isNetworkSwitchHighlighted, setIsNetworkSwitchHighlighted] =
        useState(false);
    const [isConnectHighlighted, setIsConnectHighlighted] = useState(false);

    const closeAll = () => {
        setIsNetworkSwitchHighlighted(false);
        setIsConnectHighlighted(false);
    };
    return (
        <WagmiConfig config={wagmiConfig}>
            <PageContent></PageContent>
        </WagmiConfig>
    );
}
