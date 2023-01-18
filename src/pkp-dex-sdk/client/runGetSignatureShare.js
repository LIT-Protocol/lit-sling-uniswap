// import LitJsSdk from "lit-js-sdk/build/index.node.js";
// import path from "path";
// import { readFileSync } from "fs";


/// Reads in the code to run on the Lit nodes
// const code = readFileSync(new URL("../actions/getSignatureShare.js", import.meta.url));
import LitJsSdk from "lit-js-sdk";

// const code = `const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });`

const code = `
    const sign = async () => {  
      const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
    };
    sign();
    `

/// Connects to the Lit network and acquires the PKP signature shares.
export const runGetSignatureShare = async (authSig, message, publicKey, sigName) => {
  const litNodeClient = new LitJsSdk.LitNodeClient({litNetwork: "serrano"});
  await litNodeClient.connect();

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
