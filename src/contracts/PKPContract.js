import { Contract, ethers } from "ethers";

import { APP_CONFIG, SupportedNetworks } from "../app_config";
import { getContract } from "./getContract";
import { decimalTohex, hexToDecimal, MultiETHFormat, wei2eth } from "./converter";

/**
 * (CLASS) Entry point of accessing the smart contract functionalities
 */
export class PKPContract {

  // @ts-ignore
  contract;
  // @ts-ignore
  read;

  constructor() {
    // @ts-ignore
    this.contract = ({})
    // @ts-ignore
    this.read = ({})
  }

  /**
   *
   * Connection must perform before executing any smart contract calls
   *
   * @param { Signer } signer
   * @return { void }
   */
  connect = async (props) => {

    const config = {
      network: props?.network ?? APP_CONFIG.NETWORK_NAME,
      signer: props?.signer,
      contractAddress: props?.contractAddress ?? APP_CONFIG.PKP_NFT_CONTRACT.ADDRESS
    };

    const _contract = await getContract(config);

    if (!_contract) return;

    this.contract = _contract;

    console.log("[📝 PKPContract] connect input<config>:", config);

    this.read = new ReadPKPContract(this.contract);
  }

}

/**
 * (READ CLASS) All read functions on smart contract
 */
export class ReadPKPContract {

  // @ts-ignore
  contract

  // @ts-ignore
  constructor(contract) {
    this.contract = contract;
  }

  /**
   *
   * Get mint cost for PKP
   *
   * @returns { Promise<MultiETHFormat> }
   */
  mintCost = async () => {

    const mintCost = await this.contract.mintCost();

    return wei2eth(mintCost);

  }

  /**
   * (IERC721Enumerable)
   *
   * Get all PKPs by a given address
   *
   * @param { string } ownerAddress
   * @returns { Array<string> } a list of PKP NFTs
   */
  getTokensByAddress = async (ownerAddress) => {

    // -- validate
    if (!ethers.utils.isAddress(ownerAddress)) {
      throw new Error(`Given string is not a valid address "${ownerAddress}"`);
    }

    let tokens = [];
    console.log('GET TOKENS BY ADDRESS', ownerAddress)

    for (let i = 0; ; i++) {

      let token;

      try {

        token = await this.contract.tokenOfOwnerByIndex(ownerAddress, i);

        token = hexToDecimal(token.toHexString());

        tokens.push(token);

      } catch (e) {
        console.log(`[getTokensByAddress] Ended search on index: ${i}`)
        break;
      }
    }

    return tokens;
  }

  /**
   * (IERC721Enumerable)
   *
   * Get the x latest number of tokens
   *
   * @param { number } lastNumberOfTokens
   *
   * @returns { Array<string> } a list of PKP NFTs
   *
   */
  getTokens = async (lastNumberOfTokens) => {

    let tokens = [];

    for (let i = 0; ; i++) {

      if (i >= lastNumberOfTokens) {
        break;
      }

      let token;

      try {

        token = await this.contract.tokenByIndex(i);

        token = hexToDecimal(token.toHexString());

        tokens.push(token);

      } catch (e) {
        console.log(`[getTokensByAddress] Ended search on index: ${i}`)
        break;
      }
    }

    return tokens;

  }

}
