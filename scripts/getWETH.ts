import { ethers, getNamedAccounts, network } from 'hardhat';
import { networkConfig } from '../helper-hardhat.config';
import { IWeth } from '../typechain-types';

export const ETH_DEPOSIT_AMOUNT = ethers.utils.parseEther('0.02');

export const getWeth = async () => {
	const { deployer } = await getNamedAccounts();

	const chainId = network.config.chainId!;

	if (chainId === 31337) {
		const iWeth = (await ethers.getContractAt(
			'IWeth',
			networkConfig[chainId].wEthAddress,
			deployer
		)) as IWeth;

		const txnResponse = await iWeth.deposit({ value: ETH_DEPOSIT_AMOUNT });
		await txnResponse.wait(1);

		const deployerBalance = await iWeth.balanceOf(deployer);
		console.log(`Got ${deployerBalance.toString()} WETH`);
	}
};
