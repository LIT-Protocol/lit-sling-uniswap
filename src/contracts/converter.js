// @ts-ignore
import converter from 'hex2dec';
import { ethers } from "ethers";
// import { BigNumber, ethers } from "ethers";
// -- (helper) milliseconds converter
export const milliC = (milliseconds) => {

  return {
    milliseconds,
    seconds: milliseconds / 1000,
    minutes: milliseconds / 1000 / 60,
  }
}

// -- (helper) wei to eth converter
export const wei2eth = (v) => {

  let cost = {
    wei: v,
    // eth: ethers.utils.formatEther(v),
    eth: ethers.utils.formatUnits(v),
    arg: ethers.BigNumber.from(v),
  }

  return cost;
}

// -- convert timestamp to YYYY/MM/DD format
// export const timestamp2Date = (timestamp: string): string => {
//
//   const date = require('date-and-time');
//
//   const format = 'YYYY/MM/DD HH:mm:ss';
//
//   let timestampFormatted: Date = new Date(parseInt(timestamp) * 1000);
//
//   return date.format(timestampFormatted, format);
//
// }

// // -- convert public key to address
// export const pub2Addr = (pubKey) => {
//
//   // const _pubKey = '79012fd115a5994e4b62c0375c941d41d62788cc969e92cbf1723cb5c49296ba';
//   // const _pubKey = '9be1ffba83a63b13cbaac60999704b55a11927df7d7c773dc26a0cc3c55c8abd';
//   const _pubKey = pubKey.replaceAll('0x', '');
//
//   const EC = require('elliptic').ec;
//   const keccak256 = require('js-sha3').keccak256;
//
//   let address;
//
//   try {
//     const ec = new EC('secp256k1');
//
//     // Decode public key
//     const key = ec.keyFromPublic(_pubKey, 'hex');
//     console.log("[pub2Addr] converted<key>:", key)
//
//     // Convert to uncompressed format
//     const publicKey = key.getPublic().encode('hex').slice(2);
//
//     // Now apply keccak
//     address = keccak256(Buffer.from(publicKey, 'hex')).slice(64 - 40);
//     console.log("[pub2Addr] converted<publicKey>:", publicKey)
//     console.log("[pub2Addr] converted<address>:", address)
//
//     return address;
//   } catch (err) {
//     address = '';
//     console.log(err);
//   }
//
//   return address;
//
// }

export const decimalTohex = (value) => {
  return converter.decToHex(value);
}

export const hexToDecimal = (value) => {
  return converter.hexToDec(value);
}

export const heyShorty = (addr, length = 10) => {

  if (!addr) {
    console.warn("heyShorty() -> addr cannot be empty.");
    return null;
  }

  return addr.substring(0, length) + '...' + addr.substring(addr.length - length, addr.length);
}