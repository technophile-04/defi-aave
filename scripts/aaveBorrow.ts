import { BigNumberish } from 'ethers';
import { ethers, getNamedAccounts, network } from 'hardhat';
import { networkConfig } from '../helper-hardhat.config';
import { AggregatorV3Interface, IERC20, ILendingPool } from '../typechain-types';
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

	/* Borrowing */
	let { totalDebtETH, availableBorrowsETH } = await getBorrowUserData(lendingPool, deployer);
	const daiPrice = await getDataPrice(networkConfig[chainId].daiEthPriceFeedAddress);

	const amountDAIToBorrow =
		parseFloat(availableBorrowsETH.toString()) * 0.95 * (1 / daiPrice.toNumber());

	console.log(`You can borrow ${amountDAIToBorrow}`);

	const amountDAIToBorrowWei = ethers.utils.parseEther(amountDAIToBorrow.toString());

	const daiTokenAddress = networkConfig[chainId].daiTokenAddress;
	await borrowDAI(daiTokenAddress, lendingPool, amountDAIToBorrowWei, deployer);

	await getBorrowUserData(lendingPool, deployer);

	await repay(amountDAIToBorrowWei, daiTokenAddress, lendingPool, deployer);

	await getBorrowUserData(lendingPool, deployer);
}

async function borrowDAI(
	daiAddress: string,
	lendingPool: ILendingPool,
	amountDAIToBorrowWei: BigNumberish,
	account: string
) {
	const borrowTx = await lendingPool.borrow(daiAddress, amountDAIToBorrowWei, 1, 0, account);

	await borrowTx.wait(1);

	console.log(`You have borrowed DAI!`);
}

async function repay(
	amount: BigNumberish,
	daiAddress: string,
	lendingPool: ILendingPool,
	account: string
) {
	await approveERC20(daiAddress, lendingPool.address, amount, account);

	const repayTx = await lendingPool.repay(daiAddress, amount, 1, account);

	await repayTx.wait(1);

	console.log(`Repayed !!`);
}

async function getBorrowUserData(lendingPool: ILendingPool, account: string) {
	const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
		await lendingPool.getUserAccountData(account);

	console.log(`You have ${totalCollateralETH.toString()} worth of eth deposited`);
	console.log(`You have ${totalDebtETH.toString()} worth of eth Borrowed`);
	console.log(`You can borrow ${availableBorrowsETH.toString()} worth of eth`);
	return {
		totalDebtETH,
		availableBorrowsETH,
	};
}

async function getDataPrice(priceFeedAddress: string) {
	const daiEthPriceFeed = (await ethers.getContractAt(
		'AggregatorV3Interface',
		priceFeedAddress
	)) as AggregatorV3Interface;

	const price = (await daiEthPriceFeed.latestRoundData())[1];

	console.log(`DAI/ETH price is ${ethers.utils.formatEther(price)}`);

	return price;
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

/* 

CanBorrow -> x Amount(ETH)

1DAI -> 0.008ETH
1ETH -> 1/0.008 DAI
x ETH -> x * (1/0.008) DAI



*/
