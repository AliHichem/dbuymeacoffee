import {Chain} from "viem/types/chain";

export interface NetworkMap {
    type: string;
    explorerUrl: string;
    contractAddress: string;
    supported: boolean;
}

/**
 * Supported networks
 * @type {number[]}
 *
 *  1: mainnet
 *  1337: devnet
 *  11155111: sepolia
 */
export const supportedNetworks = [1,1337,11155111]

export const getNetwork = (chain: any): NetworkMap => {
    const map: any = {
        type: null,
        explorerUrl: null,
        contractAddress: null,
        supported: supportedNetworks.includes(chain.id)
    };

    switch (chain.id) {
        case 11155111:
            map.type = 'sepolia';
            map.explorerUrl = 'https://explorer.stacks.co';
            map.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TESTNET;
            break;
        case 1:
            map.type = 'mainnet';
            map.explorerUrl = 'https://explorer.stacks.co';
            map.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET;
            break;
        case 1337:
            map.type = 'devnet';
            map.explorerUrl = 'http://localhost:8000';
            map.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_DEVNET;
            break;
    }
    return map;
};
