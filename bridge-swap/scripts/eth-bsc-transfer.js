const BridgeEth = artifacts.require('./BridgeEth.sol');
//ea25073ced401363df24e79bb4a07e79f1bdef9c1645d7d8193fd68d7088fb1b
//7479555942514b36d29444adb6c167303caea612682e24663c718745d64565f8
const privKey = '51450a71ee37d6cb38a90183b8fa9d5c3426bb3c5aa276da544745462af3c705';

module.exports = async done => {
  const accounts = await web3.eth.getAccounts();
  const balance = await web3.eth.getBalance(accounts[0]);
  const nonceCount = await web3.eth.getTransactionCount(accounts[0]);
  console.log(balance);
  console.log(nonceCount)
  const nonce = nonceCount; //Need to increment this for each new transfer
  
  const bridgeEth = await BridgeEth.deployed();
  const amount = 14;
  const message = web3.utils.soliditySha3(
    {t: 'address', v: accounts[0]},
    {t: 'address', v: accounts[0]},
    {t: 'uint256', v: amount},
    {t: 'uint256', v: nonce},
  ).toString('hex');
  const { signature } = web3.eth.accounts.sign(
    message, 
    privKey
  ); 
  await bridgeEth.burn(accounts[0], amount, nonce, signature);
  done();
}