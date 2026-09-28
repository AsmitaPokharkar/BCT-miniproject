import { ethers } from "ethers";
import type { BlockchainRegisterParams, VerificationResult, NetworkInfo } from "./types";

// CreatorProofRegistry Smart Contract ABI
const CONTRACT_ABI = [
  "function registerContent(string memory contentId, string memory contentHash, string memory metadataURI) external returns (bool)",
  "function verifyContent(string memory contentId, string memory hash) external view returns (bool matches, address creator, uint256 timestamp, string memory metadataURI, bool active)",
  "function revokeContent(string memory contentId) external returns (bool)",
  "function getContent(string memory contentId) external view returns (tuple(string contentId, string contentHash, address creator, uint256 timestamp, string metadataURI, bool active))",
  "event ContentRegistered(string indexed contentId, string contentHash, address indexed creator, uint256 timestamp, string metadataURI)",
  "event ContentRevoked(string indexed contentId, address indexed creator, uint256 timestamp)"
];

export class CreatorProofContract {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer: ethers.Signer | null;
  private contractAddress: string;
  private isMockMode: boolean;

  constructor(rpcUrl: string, privateKey: string, contractAddress: string) {
    this.contractAddress = contractAddress;
    this.isMockMode = !rpcUrl || rpcUrl.includes("mock-key") || !privateKey || privateKey.includes("0000000");

    if (this.isMockMode) {
      this.provider = ethers.getDefaultProvider();
      this.signer = null;
      this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.provider);
      return;
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.signer);
  }

  async registerContent(params: BlockchainRegisterParams): Promise<{ transactionHash: string; blockNumber: number }> {
    if (this.isMockMode) {
      throw new Error("Mock mode - use registry service for mock operations");
    }

    const tx = await this.contract.registerContent(
      params.contentId,
      params.contentHash,
      params.metadataURI
    );
    const receipt = await tx.wait(1);

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  async verifyContent(contentId: string, hash: string): Promise<VerificationResult> {
    if (this.isMockMode) {
      return {
        matches: true,
        creator: "0x0000000000000000000000000000000000000000",
        timestamp: Math.floor(Date.now() / 1000),
        metadataURI: "",
        active: true,
      };
    }

    const result = await this.contract.verifyContent(contentId, hash);
    return {
      matches: result[0],
      creator: result[1],
      timestamp: Number(result[2]),
      metadataURI: result[3],
      active: result[4],
    };
  }

  async getContent(contentId: string) {
    if (this.isMockMode) {
      return null;
    }

    try {
      const result = await this.contract.getContent(contentId);
      return {
        contentId: result[0],
        contentHash: result[1],
        creator: result[2],
        timestamp: Number(result[3]),
        metadataURI: result[4],
        active: result[5],
      };
    } catch {
      return null;
    }
  }

  async revokeContent(contentId: string): Promise<{ transactionHash: string; blockNumber: number }> {
    if (this.isMockMode) {
      throw new Error("Mock mode - use registry service for mock operations");
    }

    const tx = await this.contract.revokeContent(contentId);
    const receipt = await tx.wait(1);

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  getNetworkInfo(networkName: string, chainId: number, explorerUrl: string): NetworkInfo {
    return {
      isMockMode: this.isMockMode,
      networkName: this.isMockMode ? `${networkName} (Dev Mode)` : networkName,
      contractAddress: this.contractAddress,
      chainId,
      explorerUrl,
    };
  }

  isInMockMode(): boolean {
    return this.isMockMode;
  }
}
