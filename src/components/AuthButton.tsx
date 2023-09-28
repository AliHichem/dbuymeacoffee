import {PrimaryButton} from './Button';
import {IconWallet} from "@tabler/icons";

type ConnectWalletFunction = () => Promise<void>;
type DisconnectFunction = () => Promise<void>;

export default function AuthButton({account, connectWallet, disconnect}: {
    account: string,
    connectWallet: ConnectWalletFunction,
    disconnect: DisconnectFunction
}) {
    return (<>
            {!account ? (
                <PrimaryButton onClick={connectWallet}>
                    <div className="flex space-x-2 items-center">
                        <IconWallet className="h-5 w-6"/>
                        <div>Connect Wallet</div>
                    </div>
                </PrimaryButton>
            ) : (
                <PrimaryButton onClick={disconnect}>Disconnect</PrimaryButton>
            )}
        </>
    );
}