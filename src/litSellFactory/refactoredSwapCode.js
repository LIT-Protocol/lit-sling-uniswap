export function refactoredSwapCode() {

  // stripped down refactored swap code without signature combination at the end/
  // does not work as the gasPrice property hits a hexlify error if not directed as a string, but
  // the string does not work outside of the action

  // list of necessary variables for use with litAction
  // swapRouterAddress: SWAP_ROUTER_ADDRESS, - uniswapV3 swap router address
  // tokenIn: tokenIn, - token object including {chainId, address, decimals, symbol, name}
  // authSig: authSig, = lit authSig object including {address, derivedVia, sig, signedMessage}
  // providerUrl: providerUrl, - provider url
  // pkp: pkp, - pkp object including {address, publicKey}
  // approveCalldata, - approveCallData object assembled in ActionCreator.jsx
  // exactInputSingleCalldata - exactInputSingleCallData object assembled in ActionCreator.jsx

  // new vars
  // gasPrice - passed in from provider.getGasPrice();
  // chainId - passed in from provider.getNetwork().chainId;
  // nonceCount - passed in from provider.getTransactionCount(pkp.address) or inside from getNonce

  return `
    async function makeSwapData() {
      console.log('gasPrice', gasPrice)
      const approveTx = {
          to: tokenIn.address,
          nonce: nonceCount,
          value: 0,
          gasPrice: gasPrice,
          gasLimit: 150000,
          chainId: chainId,
          data: approveCalldata
      }
      const approveMessage = ethers.utils.arrayify(getMessage(approveTx));

      const exactInputSingleTx = {
          to: swapRouterAddress,
          value: 0,
          nonce: nonceCount + 1,
          gasPrice: gasPrice,
          gasLimit: 500000,
          chainId: chainId,
          data: exactInputSingleCalldata
      }
      const exactInputSingleMessage = ethers.utils.arrayify(getMessage(exactInputSingleTx));

      const allowSig = await LitActions.signEcdsa({ toSign: approveMessage, publicKey: pkp.publicKey, sigName: 'approveTx' });
      const exactInputSingleSig = await LitActions.signEcdsa({toSign: exactInputSingleMessage, publicKey: pkp.publicKey, sigName: 'exactInputSingleTx'});

      const stringifiedResponse = JSON.stringify({
        approveTx,
        exactInputSingleTx,
      });

      LitActions.setResponse({ response: stringifiedResponse });
    }
    
    function getMessage(transaction) {
      return ethers.utils.keccak256(ethers.utils.arrayify(ethers.utils.serializeTransaction(transaction)));
    }
    
    makeSwapData();
    
  `
}

