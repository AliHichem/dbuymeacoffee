import Container from './Container';
// import {authenticate, userSession} from '@/lib';
import Link from 'next/link';
import AuthButton from './AuthButton';

export default function AppNavbar({account, connectWallet, disconnect}) {

    return (
        <div className="bg-white">
            <Container>
                <div className="flex items-center justify-between w-full py-4">
                    <Link href="/">
                        <div className="flex items-center cursor-pointer">
                            <div className="text-l font-bold ">Buy me a coffee</div>
                            <div
                                className="ml-2 block rounded-full bg-gray-700 px-2 py-0.5 text-xs font-semibold text-white ">
                                with stacks
                            </div>
                        </div>
                    </Link>
                    <div className="flex justify-center space-x-6 md:order-2">
                        <AuthButton account={account} connectWallet={connectWallet} disconnect={disconnect}/>
                    </div>
                </div>
            </Container>
        </div>
    );
}
