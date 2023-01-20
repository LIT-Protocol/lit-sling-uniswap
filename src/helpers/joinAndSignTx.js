import { ethers } from "ethers";

function joinAndSignTx({litActionRes, key}) {
  const {signatures, response} = litActionRes;

  const encodedSignature = ethers.utils.joinSignature({
    r: "0x" + signatures[key].r,
    s: "0x" + signatures[key].s,
    recoveryParam: signatures[key].recid
  });

  const signedTx = ethers.utils.serializeTransaction(response[key], encodedSignature);
  return signedTx;
}

export {
  joinAndSignTx
};