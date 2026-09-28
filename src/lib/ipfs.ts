import type { ContentMetadata } from "./blockchain/types";

class IPFSService {
  private apiKey: string;
  private apiSecret: string;
  private gateway: string;
  private isMockMode: boolean;

  constructor() {
    this.apiKey = process.env.PINATA_API_KEY || "";
    this.apiSecret = process.env.PINATA_API_SECRET || "";
    this.gateway = process.env.IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs";
    this.isMockMode = !this.apiKey || !this.apiSecret;
  }

  async uploadMetadata(metadata: ContentMetadata): Promise<string> {
    if (this.isMockMode) {
      return this.mockUploadMetadata(metadata);
    }

    try {
      const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "pinata_api_key": this.apiKey,
          "pinata_secret_api_key": this.apiSecret,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `creatorproof-${metadata.contentId}`,
            keyvalues: {
              contentId: metadata.contentId,
              creator: metadata.creator,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.IpfsHash;
    } catch (error) {
      console.error("IPFS upload error:", error);
      throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async mockUploadMetadata(metadata: ContentMetadata): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Generate a deterministic mock CID based on contentId
    const mockCid = `Qm${metadata.contentId.slice(0, 10)}${metadata.fileHash.slice(0, 10)}Mock`;
    return mockCid;
  }

  async uploadFile(file: Buffer, fileName: string): Promise<string> {
    if (this.isMockMode) {
      return this.mockUploadFile(fileName);
    }

    try {
      const formData = new FormData();
      const uint8Array = new Uint8Array(file);
      const blob = new Blob([uint8Array], { type: "application/octet-stream" });
      formData.append("file", blob, fileName);

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          "pinata_api_key": this.apiKey,
          "pinata_secret_api_key": this.apiSecret,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.IpfsHash;
    } catch (error) {
      console.error("IPFS file upload error:", error);
      throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async mockUploadFile(fileName: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const mockCid = `QmFile${fileName.slice(0, 10)}Mock`;
    return mockCid;
  }

  getGatewayUrl(cid: string): string {
    return `${this.gateway}/${cid}`;
  }

  isInMockMode(): boolean {
    return this.isMockMode;
  }
}

export const ipfsService = new IPFSService();
