import { createOrderAndSign } from './create_order_and_sign';

console.log('Its 0x.js project!');
console.log('web3: ' + window.web3);

window.addEventListener('load', function() {
  if (typeof web3 !== 'undefined') {
    console.log('web3 is enabled')
    if (web3.currentProvider.isMetaMask === true) {
      console.log('MetaMask is active')
      createOrderAndSign();
    } else {
      console.log('MetaMask is not available')
    }
  } else {
    console.log('web3 is not found')
    // web3 = new Web3(new Web3.providers.HttpProvider("http://ropsten.infura.io/")
    // console.log('web3 initiated!')
  }

})// after load
