export function refactoredSwapCode() {

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
      const approveTx = {
          to: tokenIn.address,
          nonce: nonceCount,
          value: 0,
          nonce: nonceCount,
          gasPrice: gasPrice,
          gasLimit: 150000,
          chainId: chainId,
          data: approveCalldata
      }
      
      console.log('approveTx', approveTx)
      // const serialized = ethers.utils.serializeTransaction(approveTx);
      // console.log('serialized', serialized)

      // const approveMessage = ethers.utils.arrayify(getMessage(approveTx));
      // console.log('approveMessage', approveMessage)

      // const exactInputSingleTx = {
      //     to: swapRouterAddress,
      //     nonce: nonceCount,
      //     value: 0,
      //     nonce: nonceCount + 1,
      //     gasPrice: gasPrice,
      //     gasLimit: 500000,
      //     chainId: chainId,
      //     data: exactInputSingleCalldata
      // }
      //
      // const exactInputSingleMessage = ethers.utils.arrayify(getMessage(exactInputSingleTx));
      // console.log('exactInputSingleMessage', exactInputSingleMessage) 

      // const allowSig = await LitActions.signEcsda({message: approveMessage, publicKey: pkp.publicKey, sigName: 'approveTx'});
      // const exactInputSingleSig = await LitActions.signEcsda({message: exactInputSingleMessage, publicKey: pkp.publicKey, sigName: 'exactInputSingleTx'});
      //
      // const encodedAllowSignature = ethers.utils.joinSignature({
      //   r: "0x" + allowSig.r,
      //   s: "0x" + allowSig.s,
      //   recoveryParam: allowSig.recid
      // });
      //
      // const encodedExactInputSingleSignature = ethers.utils.joinSignature({
      //   r: "0x" + exactInputSingleSig.r,
      //   s: "0x" + exactInputSingleSig.s,
      //   recoveryParam: exactInputSingleSig.recid
      // });
      //
      // const signedAllowTx = ethers.utils.serializeTransaction(approveTx, encodedAllowSignature);
      // const signedExactInputSingleTx = ethers.utils.serializeTransaction(exactInputSingleTx, encodedExactInputSingleSignature);
      //
      // return {
      //   signedAllowTx, signedExactInputSingleTx
      // }
    }
    
    function getMessage(transaction) {
      return ethers.utils.keccak256(ethers.utils.arrayify(ethers.utils.serializeTransaction(transaction)));
    }
    
    makeSwapData();
    
  `
}

