import {
    assetDataUtils,
    BigNumber,
    ContractWrappers,
    generatePseudoRandomSalt,
    Order,
    orderHashUtils,
    signatureUtils,
    RPCSubprovider,
    Web3ProviderEngine,
    MetamaskSubprovider,
} from '0x.js';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { getContractAddressesForNetworkOrThrow } from '@0x/contract-addresses';
import { SignerSubprovider } from '@0x/subproviders';
import { DECIMALS, NULL_ADDRESS, ZERO } from './constants';
import { getRandomFutureDateInSeconds } from './utils';
import { INFURA, NETWORK_ID } from './config';

const Web3 = require('web3');
export const providerEngine = new Web3ProviderEngine();

export async function createOrderAndSign() {
  console.log('Start createOrderAndSign');

  // Compose our Providers, order matters
  // Use the MetamaskSubprovider to wrap the browser extension wallet
  // All account based and signing requests will go through the MetamaskSubprovider
  providerEngine.addProvider(new MetamaskSubprovider(window.web3.currentProvider));
  // Use an RPC provider to route all other requests
  providerEngine.addProvider(new RPCSubprovider(INFURA.KOVAN_RPC_URL));
  providerEngine.start();
  // Instantiate ContractWrappers with the provider
  const contractWrappers = new ContractWrappers(providerEngine, { networkId: NETWORK_ID.KOVAN });

  const web3Wrapper = new Web3Wrapper(providerEngine);
  const [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();
  console.log(`maker = ${maker}`);
  console.log(`taker = ${taker}`);

  // Token Addresses
  const contractAddresses = getContractAddressesForNetworkOrThrow(NETWORK_ID.KOVAN);
  console.log(`contractAddresses = ${JSON.stringify(contractAddresses)}`);

  const customTokenAddress = '0xbCbe75079da5cf33D3E7A1712F6547161f46712b';
  // const zrxTokenAddress = contractAddresses.zrxToken;
  const etherTokenAddress = contractAddresses.etherToken;
  const DECIMALS = 18;
  const makerAssetData = assetDataUtils.encodeERC20AssetData(customTokenAddress);
  const takerAssetData = assetDataUtils.encodeERC20AssetData(etherTokenAddress);
  // the amount the maker is selling of maker asset
  const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(	299792458 ), DECIMALS);
  // the amount the maker wants of taker asset
  const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber( 299792458/10000 ), DECIMALS);
  //-----------------------
  // Allow the 0x ERC20 Proxy to move Token on behalf of makerAccount
  const makerTokenApprovalTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
      customTokenAddress,
      maker,
    );
  await web3Wrapper.awaitTransactionSuccessAsync(makerTokenApprovalTxHash);

  // Allow the 0x ERC20 Proxy to move WETH on behalf of takerAccount
  // const takerWETHApprovalTxHash = (async() => {
  //   await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
  //     etherTokenAddress,
  //     taker,
  //   );
  // })();
  // (async() => {
  //   await web3Wrapper.awaitTransactionSuccessAsync(takerWETHApprovalTxHash);
  // })();

  // Convert ETH into WETH for taker by depositing ETH into the WETH contract
  // const takerWETHDepositTxHash = (async() => {
  //   await contractWrappers.etherToken.depositAsync(
  //     etherTokenAddress,
  //     takerAssetAmount,
  //     taker,
  //   );
  // })();
  // (async() => {
  //   await web3Wrapper.awaitTransactionSuccessAsync(takerWETHDepositTxHash);
  // })();


  // Set up the Order and fill it
  const customPeriod = 5*365*24*60*60;
  const randomExpiration = Number(getRandomFutureDateInSeconds()) + Number(customPeriod);
  console.log(`randomExpiration = ${randomExpiration}`);
  getExpirationInSecond(randomExpiration);
  const exchangeAddress = contractAddresses.exchange;

  // Create the order
  const order = {
      exchangeAddress,
      makerAddress: maker,
      takerAddress: NULL_ADDRESS,
      senderAddress: NULL_ADDRESS,
      feeRecipientAddress: NULL_ADDRESS,
      expirationTimeSeconds: randomExpiration,
      salt: generatePseudoRandomSalt(),
      makerAssetAmount,
      takerAssetAmount,
      makerAssetData,
      takerAssetData,
      makerFee: ZERO,
      takerFee: ZERO,
  };

  // Generate the order hash and sign it
  const orderHashHex = orderHashUtils.getOrderHashHex(order);
  console.log(`orderHashHex = ${orderHashHex}`);

  const signature = await signatureUtils.ecSignHashAsync(providerEngine, orderHashHex, maker);
  console.log(`signature = ${signature}`);
  const signedOrder = { ...order, signature };
  console.log(`signedOrder = ${signedOrder}`);
  console.log(`signedOrder = ${JSON.stringify(signedOrder)}`);

  providerEngine.stop();
}

function getExpirationInSecond(radomNumberInSeconds) {
  let remainTime = ((new Date(radomNumberInSeconds*1000)) - Date.now())/1000;
  console.log(`距離訂單過期時間還有 ${remainTime} 秒`);
}
