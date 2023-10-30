'use client'

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { arbitrum, sepolia, mainnet, localhost } from 'wagmi/chains'
import { useState } from "react";
import PageContent from "./_content";

const projectId = '119731842fced63569edee9c2ea8e54b'
const metadata = {
    name: 'My Website',
    description: 'My Website description',
    url: 'https://alihichem.github.io/',
    icons: ['https://avatars.mywebsite.com/']
}

const chains = [localhost, sepolia, mainnet ]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

createWeb3Modal({ wagmiConfig, projectId, chains })

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
