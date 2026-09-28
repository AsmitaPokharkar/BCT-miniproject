import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blockchainRegistry } from "@/lib/blockchain/registry";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const { contentId } = await params;

    const content = await prisma.content.findFirst({
      where: {
        OR: [
          { contentId: contentId },
          { id: contentId },
          { sha256Hash: contentId },
        ],
      },
      include: {
        owner: { select: { name: true, email: true } },
        blockchainRecord: true,
        verifications: {
          orderBy: { verifiedAt: "desc" },
          take: 15,
        },
        _count: {
          select: { verifications: true },
        },
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "No registered work found matching this Content ID or SHA-256 hash." },
        { status: 404 }
      );
    }

    // Verify against blockchain
    let blockchainVerification = null;
    if (content.blockchainRecord) {
      try {
        blockchainVerification = await blockchainRegistry.verifyContent(
          content.contentId,
          content.sha256Hash
        );
      } catch (error) {
        console.error("Blockchain verification error:", error);
        blockchainVerification = {
          matches: false,
          creator: "0x0000000000000000000000000000000000000000",
          timestamp: 0,
          metadataURI: "",
          active: false,
        };
      }
    }

    return NextResponse.json({
      content,
      blockchainVerification,
      networkInfo: blockchainRegistry.getNetworkInfo(),
      verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${content.contentId}`,
    });
  } catch (error: unknown) {
    console.error("Public verify GET error:", error);
    return NextResponse.json({ error: "Failed to fetch public verification record." }, { status: 500 });
  }
}
