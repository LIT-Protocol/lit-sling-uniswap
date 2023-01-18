import { ethers } from "ethers";
import { arrayify, joinSignature } from "@ethersproject/bytes";
import { serialize } from "@ethersproject/transactions";
import { keccak256 } from "@ethersproject/keccak256";
import LitJsSdk from "lit-js-sdk";

// this is a working example of a trade outside of litActions.
// we use a refactored version of Sling Protocols pkp-dex-sdk
// with any variables and functions not required at the time of
// execution passed in as static arguments.

async function assembleTrade({
                               swapRouterAddress,
                               tokenIn,
                               authSig,
                               providerUrl,
                               pkp,
                               approveCalldata,
                               exactInputSingleCalldata,
                             }) {
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);

  await initializeSwap()

  async function initializeSwap() {
    const approveRes = await executeApprove();
    await approveRes.wait();
    const swapRes = await executeUniswapV3SwapExactInputSingle()
    const resRes = await swapRes.wait();
    console.log('resRes', resRes)
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

  /// Executes a UniswapV3 exactInputSingle swap transaction.
  async function executeUniswapV3SwapExactInputSingle() {
    console.log('executeUniswapV3SwapExactInputSingle() - swapRouterAddress', swapRouterAddress)
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

  /// Signs and sends an arbitrary transaction with the PKP
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

    const code = `
    const sign = async () => {  
      const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
    };
    sign();
    `

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

export default assembleTrade;