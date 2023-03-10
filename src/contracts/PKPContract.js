import { ethers } from "ethers";

import { APP_CONFIG } from "../app_config";
import { getContract } from "./getContract";
import { hexToDecimal, wei2eth } from "./converter";

/**
 * (CLASS) Entry point of accessing the smart contract functionalities
 */
export class PKPContract {
  contract;

  read;

  constructor() {
    this.contract = ({})
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
 * (READ CLASS) All read helpers on smart contract
 */
export class ReadPKPContract {

  contract

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

    for (let i = 0; ; i++) {

      let token;

      try {

        token = await this.contract.tokenOfOwnerByIndex(ownerAddress, i);

        token = hexToDecimal(token.toHexString());

        tokens.push(token);

      } catch (e) {
        console.log(`[Lit Swap Playground] - [getTokensByAddress] Ended search on index: ${i}`)
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
        console.log(`[Lit Swap Playground] - [getTokensByAddress] Ended search on index: ${i}`)
        break;
      }
    }

    return tokens;

  }

}
