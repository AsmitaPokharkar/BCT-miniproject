/* eslint-disable */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreatorProofRegistry Smart Contract", function () {
  let contract;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CreatorProofRegistry");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  it("Should register content successfully", async function () {
    const contentId = "CP-ART-2026-7F29A1";
    const contentHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const metadataURI = "ipfs://QmTest123";

    const tx = await contract.registerContent(contentId, contentHash, metadataURI);
    await tx.wait();

    const record = await contract.getContent(contentId);
    expect(record.contentId).to.equal(contentId);
    expect(record.contentHash).to.equal(contentHash);
    expect(record.creator).to.equal(owner.address);
    expect(record.metadataURI).to.equal(metadataURI);
    expect(record.active).to.equal(true);
  });

  it("Should verify registered content correctly and detect tampered hashes", async function () {
    const contentId = "CP-ART-2026-7F29A1";
    const contentHash = "8a73f91c2e7f29a18a73f91c2e7f29a18a73f91c2e7f29a18a73f91c2e7f29a1";
    const metadataURI = "ipfs://QmTest456";

    await contract.registerContent(contentId, contentHash, metadataURI);

    const [matches, creator, timestamp, metaUri, active] = await contract.verifyContent(contentId, contentHash);
    expect(matches).to.equal(true);
    expect(creator).to.equal(owner.address);
    expect(active).to.equal(true);

    // Verify modified hash fails
    const [tamperedMatches] = await contract.verifyContent(contentId, "9999999999999999999999999999999999999999999999999999999999999999");
    expect(tamperedMatches).to.equal(false);
  });

  it("Should prevent duplicate content ID registration", async function () {
    const contentId = "CP-ART-2026-7F29A1";
    await contract.registerContent(contentId, "hash1", "uri1");
    await expect(contract.registerContent(contentId, "hash2", "uri2")).to.be.revertedWith("Content ID already registered");
  });
});
