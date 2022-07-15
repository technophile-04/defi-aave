import { BigNumberish, ethers } from 'ethers';

export interface networkConfigItem {
	wEthAddress: string;
	lendingPoolAddressProvider: string;
}

export interface networkConfigInfo {
	[key: number]: networkConfigItem;
}

const networkConfig: networkConfigInfo = {
	31337: {
		wEthAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
		lendingPoolAddressProvider: '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
	},
};

const developmentChains = ['hardhat', 'localhost'];

export { networkConfig, developmentChains };
