
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    distDir: 'build',
    reactStrictMode: true,
    images: { unoptimized: true},
    webpack: (config, context) => {
        config.externals.push({
            'utf-8-validate': 'commonjs utf-8-validate',
            'bufferutil': 'commonjs bufferutil',
        });
        if (config.plugins) {
            config.plugins.push(
                new context.webpack.IgnorePlugin({
                    resourceRegExp: /^(lokijs|pino-pretty|encoding)$/,
                }),
            )
        }
        return config;
    },
    env: {
        CONTRACT_ADDRESS_DEVNET: process.env.CONTRACT_ADDRESS_DEVNET,
        CONTRACT_ADDRESS_TESTNET: process.env.CONTRACT_ADDRESS_TESTNET,
        CONTRACT_ADDRESS_MAINNET: process.env.CONTRACT_ADDRESS_MAINNET,
        NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
        ETHER_UNIT: process.env.ETHER_UNIT,
        COFFEES_LISTING_LIMIT: process.env.COFFEES_LISTING_LIMIT
    }
}

module.exports = nextConfig
