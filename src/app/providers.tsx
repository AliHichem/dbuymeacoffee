import WalletConnect from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

export const providers = {
    walletlink: {
        package: CoinbaseWalletSDK, // Required
        options: {
            appName: "Buy me a coffee", // Required
            infuraId: process.env.INFURA_API_KEY // Required unless you provide a JSON RPC url; see `rpc` below
        }
    },
    walletconnect: {
        package: WalletConnect, // required
        options: {
            infuraId: process.env.INFURA_API_KEY // required
        }
    }
};