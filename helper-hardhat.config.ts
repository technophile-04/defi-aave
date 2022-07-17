import { BigNumberish, ethers } from 'ethers';

export interface networkConfigItem {
	wEthAddress: string;
	lendingPoolAddressProvider: string;
	daiEthPriceFeedAddress: string;
	daiTokenAddress: string;
}

export interface networkConfigInfo {
	[key: number]: networkConfigItem;
}

const networkConfig: networkConfigInfo = {
	31337: {
		wEthAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
		lendingPoolAddressProvider: '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
		daiEthPriceFeedAddress: '0x773616E4d11A78F511299002da57A0a94577F1f4',
		daiTokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
	},
};

const developmentChains = ['hardhat', 'localhost'];

export { networkConfig, developmentChains };
