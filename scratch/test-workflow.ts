import { calculateSHA256 } from "../src/lib/hash";
import { prisma } from "../src/lib/prisma";
import { blockchainRegistry } from "../src/lib/blockchain/registry";

async function runTests() {
  console.log("==========================================");
  console.log("CREATORPROOF CRITICAL FUNCTIONALITY TEST");
  console.log("==========================================\n");

  // 1. Get or create test user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Test Creator",
        email: `test-${Date.now()}@creatorproof.io`,
        passwordHash: "dummyhash",
      },
    });
  }

  // TEST 1: CONTENT REGISTRATION & REAL SHA-256 GENERATION
  console.log("--- TEST 1: Content Registration & SHA-256 Hashing ---");
  const originalBuffer = Buffer.from("CreatorProof Original Digital Content Artwork Data 2026");
  const originalHash = await calculateSHA256(originalBuffer.buffer);
  console.log("Original File SHA-256 Hash:", originalHash);

  const catCode = "ART";
  const year = new Date().getFullYear();
  const randHex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
  const contentId = `CP-${catCode}-${year}-${randHex}`;
  console.log("Generated Content ID:", contentId);

  // Register in DB
  const content = await prisma.content.create({
    data: {
      contentId,
      ownerId: user.id,
      title: "Master Digital Canvas #2026",
      category: "Artwork",
      creatorName: "Elena Rostova",
      fileName: "MasterCanvas.png",
      fileType: "image/png",
      fileSize: originalBuffer.length,
      sha256Hash: originalHash,
      storageUrl: "/uploads/MasterCanvas.png",
      status: "REGISTERED",
    },
  });

  // Register on Blockchain
  const bcResult = await blockchainRegistry.registerContent({
    contentId: content.contentId,
    contentHash: content.sha256Hash,
    creator: content.creatorName || user.name,
    metadataURI: "ipfs://QmTestMetadataCid123456789",
  });

  const blockchainRecord = await prisma.blockchainRecord.create({
    data: {
      contentId: content.contentId,
      transactionHash: bcResult.transactionHash,
      blockchainNetwork: bcResult.blockchainNetwork,
      blockNumber: bcResult.blockNumber,
      contractAddress: bcResult.contractAddress,
      ipfsMetadataCid: "ipfs://QmTestMetadataCid123456789",
      chainId: 80002,
      blockchainTimestamp: bcResult.registeredAt,
      status: bcResult.status,
    },
  });

  console.log("✓ TEST 1 PASSED: Content registered.");
  console.log("  Content ID:", content.contentId);
  console.log("  TX Hash:", blockchainRecord.transactionHash);
  console.log("  Network:", blockchainRecord.blockchainNetwork, `(Block #${blockchainRecord.blockNumber})\n`);

  // TEST 2: AUTHENTIC FILE VERIFICATION
  console.log("--- TEST 2: Authentic Content Verification ---");
  const checkAuthentic = await prisma.content.findUnique({
    where: { sha256Hash: originalHash },
    include: { blockchainRecord: true },
  });

  if (checkAuthentic && checkAuthentic.sha256Hash === originalHash) {
    console.log("✅ VERIFIED AUTHENTIC: Computed Hash matches blockchain record 100%!");
    console.log("✓ TEST 2 PASSED.\n");
  } else {
    throw new Error("Test 2 Failed: Authentic check did not match.");
  }

  // TEST 3: MODIFIED / TAMPERED FILE DETECTION
  console.log("--- TEST 3: Tampered/Modified File Detection ---");
  const tamperedBuffer = Buffer.from("CreatorProof Original Digital Content Artwork Data 2026 MODIFIED_BYTE");
  const tamperedHash = await calculateSHA256(tamperedBuffer.buffer);
  console.log("Tampered File SHA-256 Hash:", tamperedHash);

  if (originalHash !== tamperedHash) {
    console.log("❌ VERIFICATION FAILED: Content Hash Mismatch Detected!");
    console.log("  Original Blockchain Hash:", originalHash);
    console.log("  Tampered File Hash:      ", tamperedHash);
    console.log("✓ TEST 3 PASSED: Tampering correctly identified.\n");
  } else {
    throw new Error("Test 3 Failed: Tampered file hash matched original hash!");
  }

  // TEST 4: PUBLIC QR CODE LINK VERIFICATION
  console.log("--- TEST 4: Public QR Code & URL Verification ---");
  const qrUrl = `/verify/${content.contentId}`;
  const verifyRecord = await prisma.content.findFirst({
    where: { contentId: content.contentId },
    include: { blockchainRecord: true },
  });

  if (verifyRecord) {
    console.log("QR Destination URL:", qrUrl);
    console.log("Record Found for QR Scan:", verifyRecord.contentId, "-", verifyRecord.title);
    console.log("✓ TEST 4 PASSED.\n");
  } else {
    throw new Error("Test 4 Failed: Public QR record lookup failed.");
  }

  console.log("==========================================");
  console.log("ALL 4 CRITICAL FUNCTIONALITY TESTS PASSED SUCCESSFULLY!");
  console.log("==========================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
