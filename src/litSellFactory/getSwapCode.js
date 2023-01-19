export function getSwapCode() {

  // list of necessary variables for use with litAction
  // swapRouterAddress: SWAP_ROUTER_ADDRESS, - uniswapV3 swap router address
  // tokenIn: tokenIn, - token object including {chainId, address, decimals, symbol, name}
  // authSig: authSig, = lit authSig object including {address, derivedVia, sig, signedMessage}
  // providerUrl: providerUrl, - provider url
  // pkp: pkp, - pkp object including {address, publicKey}
  // approveCalldata, - approveCallData object assembled in ActionCreator.jsx
  // exactInputSingleCalldata - exactInputSingleCallData object assembled in ActionCreator.jsx

  // list of imports as modules.  action needs to use require
  // import { ethers } from "ethers";
  //   import { arrayify, joinSignature } from "@ethersproject/bytes";
  //   import { serialize } from "@ethersproject/transactions";
  //   import { keccak256 } from "@ethersproject/keccak256";
  //   import LitJsSdk from "lit-js-sdk";

  return `
    const polygonProvider = new ethers.providers.JsonRpcProvider('https://polygon-mainnet.infura.io/v3/3a16fe149ab14c7995cdab5f2c1d616c');
  
    async function executeSwap(provider) {
      async function initializeSwap() {
        let approveRes;
        try {
          approveRes = await executeApprove();
          await approveRes.wait();
          const swapRes = await executeUniswapV3SwapExactInputSingle()
          console.log('swapRes', swapRes)
          const resRes = await swapRes.wait();
          console.log('resRes', resRes)
          return resRes;
        } catch (err) {
          return err;
        }
      }
  
      async function executeApprove() {
        return provider.getTransactionCount(pkp.address).then(async (nonceCount) => {
          const tx = {
            to: tokenIn.address,
            nonce: nonceCount,
            value: 0,
            gasPrice: await provider.getGasPrice(),
            gasLimit: 150000,
            chainId: (await provider.getNetwork()).chainId,
            data: approveCalldata
          }
  
          return await pkpSignAndSendTransaction(tx, "approveTx");
        }).catch(err => {
          console.log("Error on executeApprove", err);
          return err;
        })
      }
  
      // Executes a UniswapV3 exactInputSingle swap transaction.
      async function executeUniswapV3SwapExactInputSingle() {
        return provider.getTransactionCount(pkp.address).then(async (nonceCount) => {
          const tx = {
            to: swapRouterAddress,
            // nonce: await provider.getTransactionCount(pkp.address),
            nonce: nonceCount,
            value: 0,
            gasPrice: await provider.getGasPrice(),
            gasLimit: 500000,
            chainId: (await provider.getNetwork()).chainId,
            data: exactInputSingleCalldata
          };
  
          return await pkpSignAndSendTransaction(tx, "exactInputSingleTx");
        }).catch((err) => {
          console.log('Error on executeUniswapV3SwapExactInputSingle()', err)
          return err;
        })
      }
  
      // Signs and sends an arbitrary transaction with the PKP
      async function pkpSignAndSendTransaction(tx, label) {
        const message = ethers.utils.arrayify(getMessage(tx));
        const {signatures} = await runGetSignatureShare(authSig, message, pkp.publicKey, label);
        const encodedSignature = ethers.utils.joinSignature({
          r: "0x" + signatures[label].r,
          s: "0x" + signatures[label].s,
          recoveryParam: signatures[label].recid
        });
        const signedTransaction = ethers.utils.serializeTransaction(tx, encodedSignature);
  
        return await provider.sendTransaction(signedTransaction);
      }
  
      function getMessage(transaction) {
        return ethers.utils.keccak256(ethers.utils.arrayify(ethers.utils.serializeTransaction(transaction)));
      }
  
      async function runGetSignatureShare(authSig, message, publicKey, sigName) {
        const litNodeClient = new LitJsSdk.LitNodeClient({litNetwork: "serrano", debug: false});
        await litNodeClient.connect();
  
        const code = \`
          const sign = async () => {
            const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
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
  
      return await initializeSwap();
    }
    
    executeSwap(polygonProvider).then((res) => {
      console.log('swap complete', res)
    }).catch((err) => {
      console.log('swap error', err)
    });
  `
}

