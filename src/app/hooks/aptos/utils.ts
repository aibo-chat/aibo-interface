import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { AptosUserAssetData } from "./type";
import { valueToBigNumber } from "../../utils/math-utils-v2";

export const getExplorerLink = (hash: string, networkName: string | undefined) =>
  `https://explorer.aptoslabs.com/txn/${hash}${networkName ? `?network=${networkName.toLowerCase()}` : ""}`;

export const formatAmount = (data: AptosUserAssetData | undefined) => {
  if (!data) return '0'
  return valueToBigNumber(data.amount).shiftedBy(-data.metadata.decimals).toString()
}

export const formatAddress = (address: string, from = 5, to = 5) => {
  return `${address.substring(0, from)}...${address.substring(address.length - to, address.length)}`
}

//生产的配置
export const MAINNET_CONFIG = new AptosConfig({ network: Network.MAINNET });
export const MAINNET_CLIENT = new Aptos(MAINNET_CONFIG);

export const DEVNET_CONFIG = new AptosConfig({ network: Network.DEVNET });
export const DEVNET_CLIENT = new Aptos(DEVNET_CONFIG);

export const TESTNET_CONFIG = new AptosConfig({ network: Network.TESTNET });
export const TESTNET_CLIENT = new Aptos(TESTNET_CONFIG);

export const aptosClient = (network?: string) => {
  if (network === Network.MAINNET.toLowerCase()) {
    return MAINNET_CLIENT;
  } else if (network === Network.DEVNET.toLowerCase()) {
    return DEVNET_CLIENT;
  } else if (network === Network.TESTNET.toLowerCase()) {
    return TESTNET_CLIENT;
  } else {
    throw new Error(`Unknown network: ${network}`);
  }
};