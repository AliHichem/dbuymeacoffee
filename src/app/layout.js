// import '@/assets/css/reboot.css'
import '@/assets/css/globals.css'

import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Buy Me a Coffee Dapp',
  description: 'Buy Me a Coffee Dapp on Ethereum blockchain',
}

export default function RootLayout({ children }) {

  return (
    <html lang="en">
        <head>
          <link href="https://fonts.googleapis.com/css?family=Space+Mono" rel="stylesheet"/>
          <link href="https://fonts.googleapis.com/css?family=Kaushan+Script" rel="stylesheet"/>
        </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
