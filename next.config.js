/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false
}

module.exports = nextConfig

// const webpack = require('webpack');
//
// module.exports = {
//     webpack: (config, { dev }) => {
//         config.plugins.push(
//             new webpack.ProvidePlugin({
//                 '$': 'jquery',
//                 'jQuery': 'jquery',
//             })
//         )
//         return config
//     }
// }