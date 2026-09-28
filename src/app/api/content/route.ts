import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";
import { calculateSHA256 } from "@/lib/hash";
import { blockchainRegistry } from "@/lib/blockchain/registry";
import { ipfsService } from "@/lib/ipfs";
import type { ContentMetadata } from "@/lib/blockchain/types";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const whereClause: Record<string, unknown> = {
      ownerId: user.id,
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { contentId: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
        { sha256Hash: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "All") {
      whereClause.category = category;
    }

    const contents = await prisma.content.findMany({
      where: whereClause,
      include: {
        blockchainRecord: true,
        _count: {
          select: { verifications: true },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return NextResponse.json({ contents });
  } catch (error: unknown) {
    console.error("Fetch content error:", error);
    return NextResponse.json({ error: "Failed to fetch content library." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access. Please log in." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "";
    const description = (formData.get("description") as string) || "";
    const category = (formData.get("category") as string) || "Artwork";
    const tags = (formData.get("tags") as string) || "";
    const creatorName = (formData.get("creatorName") as string) || user.name;
    const licenseInfo = (formData.get("licenseInfo") as string) || "";

    if (!file || !title) {
      return NextResponse.json({ error: "File and title are required." }, { status: 400 });
    }

    // 1. Calculate server side SHA-256 hash of file buffer
    const arrayBuffer = await file.arrayBuffer();
    const sha256Hash = await calculateSHA256(arrayBuffer);

    // 2. Check if file with exact SHA-256 hash is already registered
    const existing = await prisma.content.findUnique({
      where: { sha256Hash },
      include: { owner: { select: { name: true } } },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Duplicate File Detected!",
          message: `This exact file (SHA-256: ${sha256Hash}) has already been registered on CreatorProof by ${existing.owner.name} under Content ID [${existing.contentId}].`,
          existingContentId: existing.contentId,
        },
        { status: 409 }
      );
    }

    // 3. Save file to public/uploads disk storage
    const storageUrl = await saveUploadedFile(file);

    // 4. Generate unique readable contentId in format CP-ART-2026-7F29A1
    const catCode = category.replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase() || "ART";
    const year = new Date().getFullYear();
    const randHex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
    const contentId = `CP-${catCode}-${year}-${randHex}`;

    // 5. Save Content in database
    const content = await prisma.content.create({
      data: {
        contentId,
        ownerId: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        tags: tags.trim() || null,
        creatorName: creatorName.trim(),
        licenseInfo: licenseInfo.trim() || null,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        sha256Hash,
        storageUrl,
        status: "REGISTERED",
      },
    });

    // 6. Upload metadata to IPFS
    const metadata: ContentMetadata = {
      contentId: content.contentId,
      title: content.title,
      description: content.description || undefined,
      creator: content.creatorName || user.name,
      fileHash: content.sha256Hash,
      contentType: content.fileType,
      creationTimestamp: new Date().toISOString(),
    };

    const ipfsMetadataCid = await ipfsService.uploadMetadata(metadata);

    // 7. Register on blockchain with IPFS metadata URI
    const bcResult = await blockchainRegistry.registerContent({
      contentId: content.contentId,
      contentHash: content.sha256Hash,
      creator: content.creatorName || user.name,
      metadataURI: ipfsMetadataCid,
    });

    // 8. Save Blockchain record in database
    const networkInfo = blockchainRegistry.getNetworkInfo();
    const blockchainRecord = await prisma.blockchainRecord.create({
      data: {
        contentId: content.contentId,
        transactionHash: bcResult.transactionHash,
        blockchainNetwork: bcResult.blockchainNetwork,
        blockNumber: bcResult.blockNumber,
        contractAddress: bcResult.contractAddress,
        ipfsMetadataCid: ipfsMetadataCid,
        chainId: networkInfo.chainId,
        blockchainTimestamp: bcResult.registeredAt,
        status: bcResult.status,
      },
    });

    return NextResponse.json(
      {
        success: true,
        content: {
          ...content,
          blockchainRecord,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Register content error:", error);
    const message = error instanceof Error ? error.message : "Failed to register digital content.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
