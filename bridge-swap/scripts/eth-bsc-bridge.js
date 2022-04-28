const Web3 = require('web3');
const BridgeEth = require('../build/contracts/BridgeEth.json');
const BridgeBsc = require('../build/contracts/BridgeBsc.json');

const web3Eth = new Web3('wss://ropsten.infura.io/ws/v3/9c54905064b849e79a1ce21612fc0b82');
const web3Bsc = new Web3('https://data-seed-prebsc-2-s3.binance.org:8545');
const adminPrivKey = '51450a71ee37d6cb38a90183b8fa9d5c3426bb3c5aa276da544745462af3c705';
const { address: admin } = web3Bsc.eth.accounts.wallet.add(adminPrivKey);

const bridgeEth = new web3Eth.eth.Contract(
  BridgeEth.abi,
  BridgeEth.networks['3'].address
);

const bridgeBsc = new web3Bsc.eth.Contract(
  BridgeBsc.abi,
  BridgeBsc.networks['97'].address
);


bridgeEth.events.Transfer(
  {fromBlock: 0, step: 0}
)
.on('data', async event => {
  const { from, to, amount, date, nonce, signature } = event.returnValues;

  console.log(`
	Processed transfer:
	- from ${from} 
	- to ${to} 
	- amount ${amount} tokens
	- date ${date}
	- nonce ${nonce}
	`);
  if (nonce > 94){
	  const tx = bridgeBsc.methods.mint(from, to, amount, nonce, signature);
	  const [gasPrice, gasCost] = await Promise.all([
		web3Bsc.eth.getGasPrice(),
		tx.estimateGas({from: admin}),
	  ]);
	  const data = tx.encodeABI();
	  const txData = {
		from: admin,
		to: bridgeBsc.options.address,
		data,
		gas: gasCost,
		gasPrice
	  };
	  const receipt = await web3Bsc.eth.sendTransaction(txData);
	  console.log(`Transaction hash: ${receipt.transactionHash}`);
  };

});
