import { RouterContract } from "../contracts/RouterContract";
import LitJsSdk from "lit-js-sdk";
import { PKPContract } from "../contracts/PKPContract";
import { ethers } from "ethers";

export async function loadUserPkps() {
  const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: "polygon", switchChain: false});
  const pkpContract = new PKPContract();
  await pkpContract.connect();

  const tokens = await pkpContract.read.getTokensByAddress(authSig.address);

  const routerContract = new RouterContract();
  await routerContract.connect();

  const publicKeysPromises = tokens.map(t => {
    return routerContract.read.getFullPubKey(t);
  })

  const publicKeysResolved = await Promise.all(publicKeysPromises);

  let tokenObjs = [];
  for (let i = 0; i < tokens.length; i++) {
    tokenObjs.push({
      address: ethers.utils.computeAddress(publicKeysResolved[i]),
      tokenId: tokens[i],
      publicKey: publicKeysResolved[i],
    })
  }

  return {
    tokenObjs,
    authSig
  };

}