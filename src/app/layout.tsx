import '@/app/assets/css/globals.css'
import {Ubuntu} from 'next/font/google'
import {Toaster} from 'react-hot-toast';

const ubuntu = Ubuntu({subsets: ['latin-ext'], weight: '400'});

export const metadata = {
    title: 'Hichem Ali',
    description: 'Buy Me a Coffee Dapp on Ethereum blockchain',
}

export default function RootLayout({children}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={ubuntu.className}>{children}<Toaster/></body>
        </html>
    )
}
