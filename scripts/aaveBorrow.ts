import { BigNumberish } from 'ethers';
import { ethers, getNamedAccounts, network } from 'hardhat';
import { networkConfig } from '../helper-hardhat.config';
import { IERC20, ILendingPool } from '../typechain-types';
import { ILendingPoolAddressesProvider } from '../typechain-types/contracts/interfaces/ILendingPoolAddressesProvider';
import { ETH_DEPOSIT_AMOUNT, getWeth } from './getWETH';

async function main() {
	const chainId = network.config.chainId!;

	const wethTokenAddress = networkConfig[chainId].wEthAddress;

	await getWeth();

	const { deployer } = await getNamedAccounts();

	const lendingPool: ILendingPool = await getLendingPool(deployer);

	console.log(`LendingPool Address ${lendingPool.address}`);

	await approveERC20(wethTokenAddress, lendingPool.address, ETH_DEPOSIT_AMOUNT, deployer);

	const txnRes = await lendingPool.deposit(wethTokenAddress, ETH_DEPOSIT_AMOUNT, deployer, 0);

	await txnRes.wait(1);

	console.log(`Deposited 🎉`);
}

async function getLendingPool(deployer: string) {
	const chainId = network.config.chainId!;

	// Get Lending pool address from AddressProvider
	const lendingPoolAddressProvider = (await ethers.getContractAt(
		'ILendingPoolAddressesProvider',
		networkConfig[chainId].lendingPoolAddressProvider,
		deployer
	)) as ILendingPoolAddressesProvider;

	const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();

	const lendingPool = (await ethers.getContractAt(
		'ILendingPool',
		lendingPoolAddress,
		deployer
	)) as ILendingPool;

	return lendingPool;
}

async function approveERC20(
	erc20Address: string,
	spenderAddress: string,
	amountToSpend: BigNumberish,
	account: string
) {
	const erc20Token = (await ethers.getContractAt('IERC20', erc20Address, account)) as IERC20;

	const txnResponse = await erc20Token.approve(spenderAddress, amountToSpend);

	await txnResponse.wait(1);

	console.log(`Approved!`);
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.log(err);
		process.exit(1);
	});
