export function getSwapCode() {

  // list of necessary variables for use with litAction
  // swapRouterAddress: SWAP_ROUTER_ADDRESS, - uniswapV3 swap router address
  // tokenIn: tokenIn, - token object including {chainId, address, decimals, symbol, name}
  // authSig: authSig, = lit authSig object including {address, derivedVia, sig, signedMessage}
  // providerUrl: providerUrl, - provider url
  // pkp: pkp, - pkp object including {address, publicKey}
  // approveCalldata, - approveCallData object assembled in actionCreator.jsx
  // exactInputSingleCalldata - exactInputSingleCallData object assembled in actionCreator.jsx

  return `
    import { ethers } from "ethers";
    import { arrayify, joinSignature } from "@ethersproject/bytes";
    import { serialize } from "@ethersproject/transactions";
    import { keccak256 } from "@ethersproject/keccak256";
    import LitJsSdk from "lit-js-sdk";
  
    const executeSwap = async () => {
      async function initializeSwap() {
        const approveRes = await executeApprove();
        await approveRes.wait();
        const swapRes = await executeUniswapV3SwapExactInputSingle()
        const resRes = await swapRes.wait();
        console.log('Swap Res:', resRes)
      }
    
      async function executeApprove() {
        const tx = {
          to: tokenIn.address,
          nonce: await provider.getTransactionCount(pkp.address),
          value: 0,
          gasPrice: await provider.getGasPrice(),
          gasLimit: 150000,
          chainId: (await provider.getNetwork()).chainId,
          data: approveCalldata
        }
    
        return await pkpSignAndSendTransaction(tx, "approveTx");
      }
    
      async function executeUniswapV3SwapExactInputSingle() {
        const tx = {
          to: swapRouterAddress,
          nonce: await provider.getTransactionCount(pkp.address),
          value: 0,
          gasPrice: await provider.getGasPrice(),
          gasLimit: 500000,
          chainId: (await provider.getNetwork()).chainId,
          data: exactInputSingleCalldata
        };
    
        return await pkpSignAndSendTransaction(tx, "exactInputSingleTx");
      }
    
      async function pkpSignAndSendTransaction(tx, label) {
        const message = arrayify(getMessage(tx));
        const {signatures} = await runGetSignatureShare(authSig, message, pkp.publicKey, label);
        const encodedSignature = joinSignature({
          r: "0x" + signatures[label].r,
          s: "0x" + signatures[label].s,
          recoveryParam: signatures[label].recid
        });
        const signedTransaction = serialize(tx, encodedSignature);
    
        return await provider.sendTransaction(signedTransaction);
      }
    
      function getMessage(transaction) {
        return keccak256(arrayify(serialize(transaction)));
      }
    
      async function runGetSignatureShare(authSig, message, publicKey, sigName) {
        const litNodeClient = new LitJsSdk.LitNodeClient({litNetwork: "serrano", debug: false});
        await litNodeClient.connect();
    
        const code = \`
          const sign = async () => {
            const sigShare = await LitActions.signEcdsa({toSign, publicKey, sigName});
          };
          sign();
        \`
    
        const signatures = await litNodeClient.executeJs({
          code,
          authSig,
          jsParams: {
            publicKey,
            sigName,
            toSign: message,
          }
        });
    
        return signatures;
      }
    }
    
    executeSwap();
  `
}