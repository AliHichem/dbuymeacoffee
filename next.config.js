
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        config.externals.push({
            'utf-8-validate': 'commonjs utf-8-validate',
            'bufferutil': 'commonjs bufferutil',
        })
        return config
    },
    env: {
        CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
        NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
        ETHER_UNIT: process.env.ETHER_UNIT,
        COFFEES_LISTING_LIMIT: process.env.COFFEES_LISTING_LIMIT
    }
}

module.exports = nextConfig
