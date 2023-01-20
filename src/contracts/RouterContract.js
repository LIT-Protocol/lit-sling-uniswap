import { APP_CONFIG } from "../app_config";
import { getContract } from "./getContract";

/**
 * (CLASS) Entry point of accessing the smart contract functionalities
 */
export class RouterContract {

  contract
  read

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
      contractAddress: props?.contractAddress ?? APP_CONFIG.ROUTER_CONTRACT.ADDRESS
    };

    const _contract = await getContract(config);

    if (!_contract) {
      console.error("Failed to get contract");
    } else {
      this.contract = _contract;
      console.log("[📝 RouterContract] connect input<config>:", config);

      this.read = new ReadRouterContract(this.contract);
    }
  }

}

/**
 * (READ CLASS) All read helpers on smart contract
 */
export class ReadRouterContract {

  contract;

  constructor(contract) {
    this.contract = contract;
  }

  isRouted = async (tokenId) => {

    console.log("[RouterContracts] isRouted tokenId:", tokenId);

    const isRouted = this.contract.isRouted(tokenId);

    return isRouted;
  }

  /**
   *
   * Get the full public key of the owner of the token
   * NOTE:
   * - (NEW) Mumbai is using the getPubkey() function
   * - Celo is using the getFullPubKey() function
   * Will try to use either way to get the public key
   *
   */
  getFullPubKey = async (tokenId) => {

    let pubKey = await this.contract.getPubkey(tokenId);

    // Backward compatibility for CELO
    if (!pubKey) {
      pubKey = await this.contract.getFullPubKey(tokenId);
    }

    return pubKey;

  }


  /**
   *
   * Check if an action is registered
   *
   * @param { string } ipfsId QmZKLGf3vgYsboM7WVUS9X56cJSdLzQVacNp841wmEDRkW
   * @returns
   */
  isActionRegistered = async (ipfsId) => {

    console.warn("[*** DEPRECATED ***] isActionRegistered, this will always return true, there's no need to use this function anymore.");

    return true;
    // console.log("[isActionRegistered] input<ipfsid>:", ipfsId);

    // const ipfsMultiHash = ipfsIdToIpfsIdHash(ipfsId);
    // console.log("[isActionRegistered] converted<ipfsMultiHash>:", ipfsMultiHash);

    // const bool = await this.contract.isActionRegistered(ipfsMultiHash);
    // console.log("[isActionRegistered] output<bool>:", bool);

    // return bool;
  }

}
