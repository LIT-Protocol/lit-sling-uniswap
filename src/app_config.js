import deployedContracts from './ABIs/deployed-contracts.json';
import PKPHelper from './ABIs/PKPHelper.json';
import PKPNFT from './ABIs/PKPNFT.json';
import PKPPermissions from './ABIs/PKPPermissions.json';
import PubkeyRouter from './ABIs/PubkeyRouter.json';
import RateLimitNFT from './ABIs/RateLimitNFT.json';

export const SupportedNetworks = {
  MUMBAI_TESTNET: 'MUMBAI_TESTNET'
}

export const SUPPORTED_CHAINS = {
  [SupportedNetworks.MUMBAI_TESTNET]: {
    ABI_API: "https://api-testnet.polygonscan.com/api?module=contract&action=getabi&address=",
    EXPLORER_API: "https://mumbai.polygonscan.com/api",
    params: {
      chainId: "0x13881",
      chainName: "Mumbai",
      nativeCurrency: {name: "Matic", symbol: "MATIC", decimals: 18},
      rpcUrls: [ "https://polygon-mumbai.g.alchemy.com/v2/onvoLvV97DDoLkAmdi0Cj7sxvfglKqDh" ],
      blockExplorerUrls: [ "https://mumbai.polygonscan.com/" ],
      iconUrls: [ "future" ],
    }
  }
}

export const APP_CONFIG = {
  EXPLORER: "https://polygonscan.com/address/",
  NETWORK_NAME: SupportedNetworks.MUMBAI_TESTNET,
  NETWORK: SUPPORTED_CHAINS[SupportedNetworks.MUMBAI_TESTNET],
  NETWORK_LABEL: {
    ENABLED: true,
    NAME: 'MUMBAI TESTNET',
  },
  ECDSA_KEY: 2,
  IPFS_PIN_NAME: 'Lit Explorer v0.0.2',
  IPFS_PATH: 'https://ipfs.litgateway.com/ipfs',
  PKP_NFT_CONTRACT: {
    ADDRESS: deployedContracts.pkpNftContractAddress,
    ABI: PKPNFT.abi,
  },
  RATE_LIMIT_CONTRACT: {
    ADDRESS: deployedContracts.rateLimitNftContractAddress,
    ABI: RateLimitNFT.abi,
  },
  ROUTER_CONTRACT: {
    ADDRESS: deployedContracts.pubkeyRouterContractAddress,
    ABI: PubkeyRouter.abi,
  },
  PKP_HELPER_CONTRACT: {
    ADDRESS: deployedContracts.pkpHelperContractAddress,
    ABI: PKPHelper.abi,
  },
  PKP_PERMISSIONS_CONTRACT: {
    ADDRESS: deployedContracts.pkpPermissionsContractAddress,
    ABI: PKPPermissions.abi,
  },
  ACCS_CONTRACT: {
    ADDRESS: deployedContracts.accessControlConditionsContractAddress,
  },
  LIT_TOKEN_CONTRACT: {
    ADDRESS: deployedContracts.litTokenContractAddress,
  },
  MULTI_SENDER_CONTRACT: {
    ADDRESS: deployedContracts.multisenderContractAddress,
  },
  DEPLOYER_CONTRACT: {
    ADDRESS: "0x50e2dac5e78B5905CB09495547452cEE64426db2",
  },
  STAKED_NODE_CONTRACT: {
    ADDRESS: deployedContracts.stakingContractAddress,
  },
}