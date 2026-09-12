require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config({ path: '.env.local' });

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const accounts = DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  paths: {
    sources: './contracts',
  },
  networks: {
    // HSK Chain (HashKey Chain) — https://docs.hskchain.net
    hskTestnet: {
      url: process.env.HSK_TESTNET_RPC_URL || 'https://testnet.hsk.xyz',
      chainId: 133,
      accounts,
    },
    hskMainnet: {
      url: process.env.HSK_MAINNET_RPC_URL || 'https://mainnet.hsk.xyz',
      chainId: 177,
      accounts,
    },
    // Avalanche C-Chain — https://build.avax.network
    avalancheFuji: {
      url: process.env.AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
      chainId: 43113,
      accounts,
    },
    avalancheMainnet: {
      url: process.env.AVALANCHE_MAINNET_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
      chainId: 43114,
      accounts,
    },
  },
  etherscan: {
    // Snowtrace (via Routescan) y el explorer de HSK no piden una API key real,
    // cualquier texto sirve como placeholder — no hace falta crear cuenta en ningun lado.
    apiKey: {
      avalancheFujiTestnet: 'no-key-needed',
      avalanche: 'no-key-needed',
      hskTestnet: 'no-key-needed',
      hskMainnet: 'no-key-needed',
    },
    customChains: [
      {
        network: 'hskTestnet',
        chainId: 133,
        urls: {
          apiURL: 'https://testnet-explorer.hskchain.net/api',
          browserURL: 'https://testnet-explorer.hskchain.net',
        },
      },
      {
        network: 'hskMainnet',
        chainId: 177,
        urls: {
          apiURL: 'https://explorer.hsk.xyz/api',
          browserURL: 'https://explorer.hsk.xyz',
        },
      },
      {
        network: 'avalancheFujiTestnet',
        chainId: 43113,
        urls: {
          apiURL: 'https://api.routescan.io/v2/network/testnet/evm/43113/etherscan',
          browserURL: 'https://testnet.snowtrace.io',
        },
      },
      {
        network: 'avalanche',
        chainId: 43114,
        urls: {
          apiURL: 'https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan',
          browserURL: 'https://snowtrace.io',
        },
      },
    ],
  },
};
