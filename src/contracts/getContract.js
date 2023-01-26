// import { Contract, ContractInterface, ethers, Signer, Wallet } from "ethers";
import { Contract, ethers, Signer } from "ethers";
import { APP_CONFIG, SupportedNetworks } from '../app_config';


/**
 *
 * Get the signer of the given network, otherwise automatically
 * generates a private key to create a signer
 *
 * @param { SupportedNetworks } network
 * @return { Signer }
 */

export const getSigner = async (network) => {

  console.log("[getSigner] network", network);

  let signer;

  const randomPrivateKey = ethers.Wallet.createRandom().privateKey;

  const provider = new ethers.providers.JsonRpcProvider(APP_CONFIG.NETWORK.params.rpcUrls[0]);

  signer = new ethers.Wallet(randomPrivateKey, provider);


  return signer;

}


export const getContractFromAppConfig = (address) => {

  const contracts = [];

  Object.entries(APP_CONFIG).forEach((e) => {

    const item = e[1];

    if (item) {
      if (item['ABI'] !== undefined) {
        contracts.push(item);
      }
    }

  });

  let contract = contracts.find((item) => item.ADDRESS === address)

  return contract;
}

/**
 *
 * Get the ABI code from the given API and contract address
 *
 * @property { SupportedNetworks } network
 * @property { string } contractAddress
 *
 * @return { Promise<ContractInterface } ABI
 */
export const getABI = async ({network, contractAddress}) => {

  // console.log("--- getABI ---");

  let ABI;

  if (!contractAddress) {
    throw new Error("Contract address cannot be enpty");
  }

  try {

    // const ABI_API = selectedNetwork.ABI_API + contractAddress;

    // const data = await fetch(ABI_API)
    // .then((res) => res.json())
    // .then((data) => data.result);

    // ABI = data;
    ABI = getContractFromAppConfig(contractAddress).ABI;

    // -- using fallback
    // if( data.includes('Max rate limit reached')){
    //     console.warn("Using fallback for contract:", contractAddress);
    //     let found : any = Object.entries(ABIsFallback).find((item) => item[0].toLowerCase() == contractAddress.toLocaleLowerCase());

    //     ABI = JSON.parse(found[1]);
    // }

    // console.log("ABI from getABI:", ABI);

    // -- finally

  } catch (e) {
    throw new Error("Error while fetching ABI from API:", e);
  }

  return ABI;

}

/**
 *
 * Get the ABI code of a contract by network
 *
 * @property { SupportedNetworks } network
 * @property { Signer } signer
 * @property { string } contractAddress
 *
 * @return { Contract } ABI in json format
 */
export const getContract = async (props) => {

  let signer = props?.signer ?? await getSigner(props.network);

  let ABI;

  const _contractAddress = props.contractAddress ?? '';

  if (_contractAddress === '') {
    console.error("Contract address cannot be empty");
    return;
  }

  // -- If it's running from Node, don't bother using local storage
  if (typeof window === 'undefined') {
    ABI = await getABI({
      network: props.network,
      contractAddress: props.contractAddress
    });
  } else {

    // -- if ABI exists in local storage
    if (!sessionStorage.getItem(_contractAddress)) {
      ABI = await getABI({
        network: props.network,
        contractAddress: _contractAddress
      });

      sessionStorage.setItem(_contractAddress, JSON.stringify(ABI))

      // -- if ABI does NOT exist in local storage
    } else {
      const data = sessionStorage.getItem(_contractAddress);
      const parsed = JSON.parse(data ?? '');
      ABI = parsed;
    }
  }

  // -- validate: check contract is verified
  if (ABI === 'Contract source code not verified') {
    throw new Error(`Contract source code not verified for ${_contractAddress}`);
  }

  // console.log("_contractAddress:", _contractAddress);

  // console.log("Find object...");

  // -- finally, get the contract instance
  let contract;

  try {
    contract = new ethers.Contract(_contractAddress, ABI, signer);
  } catch (e) {
    throw new Error("Error creating contract instance:", e);
  }

  return contract

}