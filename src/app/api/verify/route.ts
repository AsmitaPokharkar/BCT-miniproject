import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateSHA256 } from "@/lib/hash";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let calculatedHash = "";
    let searchContentId = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      searchContentId = (formData.get("contentId") as string) || "";

      if (file) {
        const buffer = await file.arrayBuffer();
        calculatedHash = await calculateSHA256(buffer);
      }
    } else {
      const body = await request.json();
      calculatedHash = body.sha256Hash || "";
      searchContentId = body.contentId || "";
    }

    if (!calculatedHash && !searchContentId) {
      return NextResponse.json(
        { error: "Please provide a file to compute SHA-256 or enter a hash/Content ID." },
        { status: 400 }
      );
    }

    let matchedContent = null;

    if (calculatedHash) {
      matchedContent = await prisma.content.findUnique({
        where: { sha256Hash: calculatedHash },
        include: {
          owner: { select: { name: true, email: true } },
          blockchainRecord: true,
          _count: { select: { verifications: true } },
        },
      });
    }

    if (!matchedContent && searchContentId) {
      matchedContent = await prisma.content.findFirst({
        where: {
          OR: [{ contentId: searchContentId }, { id: searchContentId }],
        },
        include: {
          owner: { select: { name: true, email: true } },
          blockchainRecord: true,
          _count: { select: { verifications: true } },
        },
      });
    }

    let resultStatus: "VERIFIED_AUTHENTIC" | "TAMPERED_HASH_MISMATCH" | "NOT_FOUND" = "NOT_FOUND";

    if (matchedContent) {
      if (calculatedHash && matchedContent.sha256Hash !== calculatedHash) {
        resultStatus = "TAMPERED_HASH_MISMATCH";
      } else {
        resultStatus = "VERIFIED_AUTHENTIC";
      }

      // Record verification log in database
      const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
      await prisma.verification.create({
        data: {
          contentId: matchedContent.contentId,
          verificationHash: calculatedHash || matchedContent.sha256Hash,
          result: resultStatus,
          ipAddress: ipAddress.split(",")[0].trim(),
        },
      });
    }

    return NextResponse.json({
      status: resultStatus,
      verificationHash: calculatedHash,
      content: matchedContent,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Verification POST error:", error);
    return NextResponse.json({ error: "Failed to perform verification check." }, { status: 500 });
  }
}
