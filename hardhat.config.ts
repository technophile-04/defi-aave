import * as dotenv from 'dotenv';

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: '0.4.19' },
      { version: '0.6.12' },
      { version: '0.8.9' },
      { version: '0.8.8' },
    ],
  },
  defaultNetwork: 'hardhat',
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 4,
    },
    hardhat: {
      chainId: 31337,
      forking: {
        url: process.env.MAINNET_RPC_URL || '',
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  mocha: {
    timeout: 500000,
  },
};

export default config;
