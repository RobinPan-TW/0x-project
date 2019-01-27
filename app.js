import {
    assetDataUtils,
    BigNumber,
    ContractWrappers,
    generatePseudoRandomSalt,
    Order,
    orderHashUtils,
    signatureUtils,
} from '0x.js';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { getContractAddressesForNetworkOrThrow } from '@0x/contract-addresses';
import { SignerSubprovider } from '@0x/subproviders';
import { DECIMALS, NULL_ADDRESS, ZERO } from './constants';
import { getRandomFutureDateInSeconds } from './utils';
import { INFURA, NETWORK_ID } from './config';
//-----------------------
import { RPCSubprovider, Web3ProviderEngine, MetamaskSubprovider } from '0x.js';

var Web3 = require('web3');
export const providerEngine = new Web3ProviderEngine();

export async function createOrderAndSigned() {
  console.log('Start createOrderAndSigned');
  // export const providerEngine = new Web3ProviderEngine();
  // providerEngine.addProvider(new RPCSubprovider('http://localhost:8545'));

  // Compose our Providers, order matters
  // Use the SignerSubprovider to wrap the browser extension wallet
  // All account based and signing requests will go through the SignerSubprovider
  providerEngine.addProvider(new MetamaskSubprovider(window.web3.currentProvider));
  // Use an RPC provider to route all other requests
  providerEngine.addProvider(new RPCSubprovider(INFURA.KOVAN_RPC_URL));
  providerEngine.start();
  // Instantiate ContractWrappers with the provider
  //const contractWrappers = new ContractWrappers(providerEngine, { networkId: NETWORK_CONFIGS.networkId });
  const contractWrappers = new ContractWrappers(providerEngine, { networkId: NETWORK_ID.KOVAN });
  //-----------------------
  const web3Wrapper = new Web3Wrapper(providerEngine);
  const [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();
  console.log(`maker = ${maker}`);
  console.log(`taker = ${taker}`);
  // const maker = '0x7b1f2fc4ebd6f9e58f7bfb20aca8d8a0be1f7f2a';
  //-----------------------
  // Token Addresses
  const contractAddresses = getContractAddressesForNetworkOrThrow(NETWORK_ID.KOVAN);
  console.log(`contractAddresses = ${JSON.stringify(contractAddresses)}`);
  // const contractAddresses = getContractAddressesForNetworkOrThrow(3);
  // const contractAddresses = {
  //   zrxToken: '0x2002d3812f58e35f0ea1ffbf80a75a38c32175fa',
  //   etherToken: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
  //   exchange: '0x35dd2932454449b14cee11a94d3674a936d5d7b2'
  // };
  const customTokenAddress = '0xbCbe75079da5cf33D3E7A1712F6547161f46712b';
  const zrxTokenAddress = contractAddresses.zrxToken;
  const etherTokenAddress = contractAddresses.etherToken;
  const DECIMALS = 18;
  //-----------------------
  const makerAssetData = assetDataUtils.encodeERC20AssetData(customTokenAddress);
  const takerAssetData = assetDataUtils.encodeERC20AssetData(etherTokenAddress);
  // the amount the maker is selling of maker asset
  const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(	299792458 ), DECIMALS);
  // the amount the maker wants of taker asset
  const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber( 299792458/10000 ), DECIMALS);
  //-----------------------
  // Allow the 0x ERC20 Proxy to move ZRX on behalf of makerAccount
  const makerZRXApprovalTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
      customTokenAddress,
      maker,
    );
  await web3Wrapper.awaitTransactionSuccessAsync(makerZRXApprovalTxHash);

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

  //-----------------------
  // Set up the Order and fill it
  const randomExpiration = getRandomFutureDateInSeconds();
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
      expirationTimeSeconds: randomExpiration + 5*365*24*60*60,
      salt: generatePseudoRandomSalt(),
      makerAssetAmount,
      takerAssetAmount,
      makerAssetData,
      takerAssetData,
      makerFee: ZERO,
      takerFee: ZERO,
  };
  //-----------------------
  // Generate the order hash and sign it
  const orderHashHex = orderHashUtils.getOrderHashHex(order);
  console.log(`orderHashHex = ${orderHashHex}`);
  //-----------------------

  const signature = await signatureUtils.ecSignHashAsync(providerEngine, orderHashHex, maker);
  console.log(`signature = ${signature}`);
  const signedOrder = { ...order, signature };
  console.log(`signedOrder = ${signedOrder}`);
  console.log(`signedOrder = ${JSON.stringify(signedOrder)}`);


  //-----------------------
  // await contractWrappers.exchange.validateFillOrderThrowIfInvalidAsync(signedOrder, takerAssetAmount, taker);

  // Stop the Provider Engine
  providerEngine.stop();
}

function getExpirationInSecond(radomNumberInSeconds) {
  let remainTime = ((new Date(radomNumberInSeconds*1000)) - Date.now())/1000;
  console.log(`距離訂單過期時間還有 ${remainTime} 秒`);
}

const Robin = require('./Robin.js');

console.log('Its 0x.js project!');

console.log('web3: ' + window.web3);
//console.log('web3.selectedAddress: ' + window.web3.selectedAddress);
//console.log('web3.networkVersion: ' + window.web3.networkVersion);

window.addEventListener('load', function() {
  if (typeof web3 !== 'undefined') {
    console.log('web3 is enabled')
    if (web3.currentProvider.isMetaMask === true) {
      console.log('MetaMask is active')
      createOrderAndSigned();
    } else {
      console.log('MetaMask is not available')
    }
  } else {
    console.log('web3 is not found')
    // web3 = new Web3(new Web3.providers.HttpProvider("http://ropsten.infura.io/")
    // console.log('web3 initiated!')
  }

})// after load


// const assetData1 = assetDataUtils.encodeERC20AssetData('0x1dc4c1cefef38a777b15aa20260a54e584b16c48');
//
// console.log('Answer: 0xf47261b00000000000000000000000001dc4c1cefef38a777b15aa20260a54e584b16c48');
// console.log(`Result: ${assetData1}`);
