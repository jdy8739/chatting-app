/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    productionBrowserSourceMaps: false,
    distDir: 'build',
    images: {
        domains: ['localhost']
    },
}

module.exports = nextConfig;