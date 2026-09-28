export interface ContentMetadata {
  contentId: string;
  title: string;
  description?: string;
  creator: string;
  fileHash: string;
  contentType: string;
  creationTimestamp: string;
}

export interface BlockchainRegisterParams {
  contentId: string;
  contentHash: string;
  creator: string;
  metadataURI: string;
}

export interface BlockchainResult {
  transactionHash: string;
  blockNumber: number;
  contractAddress: string;
  network: string;
  blockchainNetwork: string;
  status: "CONFIRMED" | "PENDING" | "FAILED";
  registeredAt: Date;
}

export interface VerificationResult {
  matches: boolean;
  creator: string;
  timestamp: number;
  metadataURI: string;
  active: boolean;
}

export interface NetworkInfo {
  isMockMode: boolean;
  networkName: string;
  contractAddress: string;
  chainId?: number;
  explorerUrl?: string;
}
