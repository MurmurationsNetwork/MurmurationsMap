/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL,
    INDEX_URL: process.env.INDEX_URL,
  }
}

module.exports = nextConfig
