import { ethers } from "ethers";
import { CreatorProofContract } from "./contract";
import type { BlockchainRegisterParams, BlockchainResult, VerificationResult, NetworkInfo } from "./types";

class BlockchainRegistry {
  private contract: CreatorProofContract;
  private networkName: string;
  private chainId: number;
  private explorerUrl: string;

  constructor() {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "";
    const privateKey = process.env.PRIVATE_KEY || "";
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

    this.networkName = process.env.BLOCKCHAIN_NETWORK || "Polygon Amoy Testnet";
    this.chainId = parseInt(process.env.CHAIN_ID || "80002");
    this.explorerUrl = process.env.BLOCKCHAIN_EXPLORER_URL || "https://amoy.polygonscan.com";

    this.contract = new CreatorProofContract(rpcUrl, privateKey, contractAddress);
  }

  async registerContent(params: BlockchainRegisterParams): Promise<BlockchainResult> {
    if (this.contract.isInMockMode()) {
      return this.registerMockContent(params);
    }

    try {
      const result = await this.contract.registerContent(params);
      return {
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        contractAddress: this.contract.getNetworkInfo(this.networkName, this.chainId, this.explorerUrl).contractAddress,
        network: this.networkName,
        blockchainNetwork: this.networkName,
        status: "CONFIRMED",
        registeredAt: new Date(),
      };
    } catch (error) {
      console.error("Blockchain registration error:", error);
      throw new Error(`Failed to register on blockchain: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async registerMockContent(params: BlockchainRegisterParams): Promise<BlockchainResult> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const seedString = `${params.contentId}-${params.contentHash}-${Date.now()}`;
    const txHashBytes = ethers.keccak256(ethers.toUtf8Bytes(seedString));
    const mockBlockNumber = 5850000 + Math.floor(Math.random() * 50000);

    return {
      transactionHash: txHashBytes,
      blockNumber: mockBlockNumber,
      contractAddress: this.contract.getNetworkInfo(this.networkName, this.chainId, this.explorerUrl).contractAddress,
      network: `${this.networkName} (Dev Mode)`,
      blockchainNetwork: `${this.networkName} (Dev Mode)`,
      status: "CONFIRMED",
      registeredAt: new Date(),
    };
  }

  async verifyContent(contentId: string, hash: string): Promise<VerificationResult> {
    return this.contract.verifyContent(contentId, hash);
  }

  async getContent(contentId: string) {
    return this.contract.getContent(contentId);
  }

  async revokeContent(contentId: string): Promise<BlockchainResult> {
    if (this.contract.isInMockMode()) {
      throw new Error("Revocation not supported in mock mode");
    }

    try {
      const result = await this.contract.revokeContent(contentId);
      return {
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        contractAddress: this.contract.getNetworkInfo(this.networkName, this.chainId, this.explorerUrl).contractAddress,
        network: this.networkName,
        blockchainNetwork: this.networkName,
        status: "CONFIRMED",
        registeredAt: new Date(),
      };
    } catch (error) {
      console.error("Blockchain revocation error:", error);
      throw new Error(`Failed to revoke on blockchain: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  getNetworkInfo(): NetworkInfo {
    return this.contract.getNetworkInfo(this.networkName, this.chainId, this.explorerUrl);
  }

  isInMockMode(): boolean {
    return this.contract.isInMockMode();
  }
}

export const blockchainRegistry = new BlockchainRegistry();
