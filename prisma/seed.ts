/* eslint-disable */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CreatorProof database seeding...");

  // Clean existing records
  await prisma.verification.deleteMany();
  await (prisma as any).aIAnalysis.deleteMany();
  await prisma.blockchainRecord.deleteMany();
  await prisma.content.deleteMany();
  await prisma.user.deleteMany();

  // Create 3 demo users
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const creator1 = await prisma.user.create({
    data: {
      name: "Elena Rostova",
      email: "elena@creatorproof.io",
      passwordHash: hashedPassword,
    },
  });

  const creator2 = await prisma.user.create({
    data: {
      name: "Marcus Chen",
      email: "marcus@creatorproof.io",
      passwordHash: hashedPassword,
    },
  });

  const creator3 = await prisma.user.create({
    data: {
      name: "Sofia Rodriguez",
      email: "sofia@creatorproof.io",
      passwordHash: hashedPassword,
    },
  });

  console.log(`👤 Created 3 demo users: ${creator1.name}, ${creator2.name}, ${creator3.name}`);

  // Sample registered contents (8 items across 3 creators)
  const items = [
    {
      contentId: "CP-ART-984210",
      title: "Cybernetic Canvas #42 - Digital Synthesis",
      description: "Original high-resolution 3D generative artwork rendered in 8K resolution with ray tracing. Authenticated for digital gallery exhibition.",
      category: "Artwork",
      tags: "cyberpunk, 3d, generative, synthwave, 8k",
      creatorName: "Elena Rostova",
      licenseInfo: "CC BY-NC-ND 4.0 - CreatorProof Authenticated Edition",
      fileName: "cybernetic_canvas_42_render.png",
      fileType: "image/png",
      fileSize: 14829012,
      sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      storageUrl: "/samples/cybernetic_canvas.png",
      status: "REGISTERED",
      txHash: "0x7d94f2913a37b19dfb4e9104b901a1c322b2742111d4e782a17621c0b315220c",
      blockNumber: 5849201,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      ownerId: creator1.id,
      ipfsCid: "QmXyZ123456789",
    },
    {
      contentId: "CP-PHO-551029",
      title: "Aurora Borealis over Tromsø Fjord",
      description: "Raw uncompressed long-exposure night photography capturing vibrant green solar plasma particles over Northern Norway.",
      category: "Photography",
      tags: "photography, nature, aurora, landscape, norway",
      creatorName: "Elena Rostova",
      licenseInfo: "Exclusive Commercial License #2026-NOR-09",
      fileName: "aurora_tromso_night_master.tiff",
      fileType: "image/tiff",
      fileSize: 45210940,
      sha256Hash: "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
      storageUrl: "/samples/aurora_tromso.png",
      status: "REGISTERED",
      txHash: "0x8a12c4913a37b19dfb4e9104b901a1c322b2742111d4e782a17621c0b984391a",
      blockNumber: 5851020,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      ownerId: creator1.id,
      ipfsCid: "QmAbC987654321",
    },
    {
      contentId: "CP-DOC-110293",
      title: "Decentralized Hash Ledger Protocol Specification v2.4",
      description: "Technical whitepaper defining SHA-256 content verification standards and cryptographic proof timestamping on EVM blockchains.",
      category: "Digital Documents",
      tags: "whitepaper, blockchain, crypto, specification, architecture",
      creatorName: "Marcus Chen",
      licenseInfo: "MIT Open Publication License",
      fileName: "decentralized_hash_ledger_v2.4.pdf",
      fileType: "application/pdf",
      fileSize: 3140920,
      sha256Hash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      storageUrl: "/samples/protocol_specification.pdf",
      status: "REGISTERED",
      txHash: "0x3f9942013a37b19dfb4e9104b901a1c322b2742111d4e782a17621c0b112999",
      blockNumber: 5854812,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ownerId: creator2.id,
      ipfsCid: "QmDef456789012",
    },
    {
      contentId: "CP-AUD-773901",
      title: "Ambient Horizon - Studio Master Mix (24-bit/96kHz)",
      description: "Original uncompressed cinematic audio score composed with modular synthesizers and orchestral cello arrangements.",
      category: "Audio",
      tags: "audio, music, ambient, cinematic, wav",
      creatorName: "Marcus Chen",
      licenseInfo: "Standard Royalty-Free Sync License",
      fileName: "ambient_horizon_master_2496.wav",
      fileType: "audio/wav",
      fileSize: 89104920,
      sha256Hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
      storageUrl: "/samples/ambient_horizon.wav",
      status: "REGISTERED",
      txHash: "0x1b44c8013a37b19dfb4e9104b901a1c322b2742111d4e782a17621c0b551000",
      blockNumber: 5859104,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      ownerId: creator2.id,
      ipfsCid: "QmGhi789012345",
    },
    {
      contentId: "CP-POS-882041",
      title: "Neo Tokyo Synthwave Festival 2026 - Official Poster",
      description: "Vector graphic poster design created for international music festival print distribution.",
      category: "Posters",
      tags: "poster, design, synthwave, tokio, vector",
      creatorName: "Sofia Rodriguez",
      licenseInfo: "All Rights Reserved - Official Event Branding",
      fileName: "neo_tokyo_poster_2026_vector.pdf",
      fileType: "application/pdf",
      fileSize: 18409200,
      sha256Hash: "e04fd020ea3a6910a2d808002b30309d906e300188686d1f03e30f1406830727",
      storageUrl: "/samples/neo_tokyo_poster.png",
      status: "REGISTERED",
      txHash: "0x9c8821013a37b19dfb4e9104b901a1c322b2742111d4e782a17621c0b778211",
      blockNumber: 5863920,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      ownerId: creator3.id,
      ipfsCid: "QmJkl345678901",
    },
    {
      contentId: "CP-ART-334455",
      title: "Quantum Dreamscape - Abstract Oil on Canvas",
      description: "Large-scale abstract expressionist painting exploring quantum mechanics through color theory and texture.",
      category: "Artwork",
      tags: "painting, abstract, oil, canvas, quantum",
      creatorName: "Sofia Rodriguez",
      licenseInfo: "All Rights Reserved",
      fileName: "quantum_dreamscape_oil.jpg",
      fileType: "image/jpeg",
      fileSize: 22109012,
      sha256Hash: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
      storageUrl: "/samples/quantum_dreamscape.jpg",
      status: "REGISTERED",
      txHash: "0x2d77b3013a37b19dfb4e9104b901a1c322b2742111d4e782a17621c0b889322",
      blockNumber: 5864500,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      ownerId: creator3.id,
      ipfsCid: "QmMno234567890",
    },
    {
      contentId: "CP-VID-667788",
      title: "Urban Exploration - Tokyo Underground",
      description: "Documentary short film exploring abandoned subway tunnels beneath Tokyo's metropolitan area.",
      category: "Video",
      tags: "video, documentary, tokyo, urban, exploration",
      creatorName: "Elena Rostova",
      licenseInfo: "Creative Commons BY-SA 4.0",
      fileName: "tokyo_underground_4k.mp4",
      fileType: "video/mp4",
      fileSize: 156710920,
      sha256Hash: "b2c3d4e5f67890123456789012345678901234567890123456789012345678901",
      storageUrl: "/samples/tokyo_underground.mp4",
      status: "REGISTERED",
      txHash: "0x4e99c4013a37b19dfb4e9104b901a1c322b2742111d4e782a17621c0b990433",
      blockNumber: 5865200,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      ownerId: creator1.id,
      ipfsCid: "QmPqr567890123",
    },
    {
      contentId: "CP-DES-889900",
      title: "Minimalist Brand Identity System",
      description: "Complete brand identity package including logo, color palette, typography system, and usage guidelines.",
      category: "Design",
      tags: "design, branding, logo, minimalist, identity",
      creatorName: "Marcus Chen",
      licenseInfo: "Commercial License",
      fileName: "minimalist_brand_system.zip",
      fileType: "application/zip",
      fileSize: 45210920,
      sha256Hash: "c3d4e5f678901234567890123456789012345678901234567890123456789012",
      storageUrl: "/samples/minimalist_brand.zip",
      status: "REGISTERED",
      txHash: "0x5f00d5013a37b19dfb4e9104b901a1c322b2742111d4e782a17621c0baa1544",
      blockNumber: 5866000,
      createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
      ownerId: creator2.id,
      ipfsCid: "QmStu678901234",
    },
  ];

  for (const item of items) {
    const createdContent = await prisma.content.create({
      data: {
        contentId: item.contentId,
        ownerId: item.ownerId,
        title: item.title,
        description: item.description,
        category: item.category,
        tags: item.tags,
        creatorName: item.creatorName,
        licenseInfo: item.licenseInfo,
        fileName: item.fileName,
        fileType: item.fileType,
        fileSize: item.fileSize,
        sha256Hash: item.sha256Hash,
        storageUrl: item.storageUrl,
        status: item.status,
        createdAt: item.createdAt,
      },
    });

    await prisma.blockchainRecord.create({
      data: {
        contentId: createdContent.contentId,
        transactionHash: item.txHash,
        blockchainNetwork: "Polygon Amoy Testnet",
        blockNumber: item.blockNumber,
        contractAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        ipfsMetadataCid: item.ipfsCid,
        chainId: 80002,
        registeredAt: item.createdAt,
        blockchainTimestamp: item.createdAt,
        status: "CONFIRMED",
      },
    });

    // Create AI analysis for each content
    await (prisma as any).aIAnalysis.create({
      data: {
        contentId: createdContent.contentId,
        description: `AI-generated description for ${item.title}. This content has been analyzed for authenticity and categorization.`,
        summary: `Summary of ${item.title}: ${item.description?.substring(0, 100)}...`,
        tags: item.tags,
        suggestedCategory: item.category,
        keywords: item.tags?.split(", ")?.slice(0, 5).join(", "),
        confidence: 0.85,
      },
    });

    // Create 3-6 mock verification entries per content item
    const verificationLogs = [
      { result: "VERIFIED_AUTHENTIC", offsetDays: 0, ip: "192.168.1.10" },
      { result: "VERIFIED_AUTHENTIC", offsetDays: 1, ip: "84.22.109.12" },
      { result: "VERIFIED_AUTHENTIC", offsetDays: 2, ip: "104.28.192.4" },
      { result: "TAMPERED_HASH_MISMATCH", offsetDays: 3, ip: "45.142.120.9" },
    ];

    for (const log of verificationLogs) {
      await prisma.verification.create({
        data: {
          contentId: createdContent.contentId,
          verificationHash: log.result === "VERIFIED_AUTHENTIC" ? item.sha256Hash : "1111111111111111111111111111111111111111111111111111111111111111",
          result: log.result,
          ipAddress: log.ip,
          verifiedAt: new Date(Date.now() - log.offsetDays * 24 * 60 * 60 * 1000),
        },
      });
    }

    console.log(`✅ Registered content: [${createdContent.contentId}] ${createdContent.title}`);
  }

  console.log("✨ Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
