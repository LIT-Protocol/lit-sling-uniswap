import LitJsSdk from 'lit-js-sdk';
import { LitPKP } from "lit-pkp-sdk";

export async function createPkpWallet(pkpData, provider) {
  const controllerAuthSig = await LitJsSdk.checkAndSignAuthMessage({
    chain: 'polygon',
    switchChain: false,
  });
  const pkpWallet = new LitPKP({
    pkpPubKey: pkpData.publicKey,
    controllerAuthSig: controllerAuthSig,
    provider,
  })

  await pkpWallet.init();

  console.log('createPkpWallet() - pkpWallet', pkpWallet)

  return pkpWallet;
}