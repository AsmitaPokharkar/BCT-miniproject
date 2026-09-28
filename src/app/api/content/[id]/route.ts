import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const content = await prisma.content.findFirst({
      where: {
        OR: [{ id }, { contentId: id }],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        blockchainRecord: true,
        verifications: {
          orderBy: { verifiedAt: "desc" },
          take: 20,
        },
        _count: {
          select: { verifications: true },
        },
      },
    });

    if (!content) {
      return NextResponse.json({ error: "Content item not found." }, { status: 404 });
    }

    return NextResponse.json({ content });
  } catch (error: unknown) {
    console.error("Get content item error:", error);
    return NextResponse.json({ error: "Failed to fetch content details." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await params;
    const content = await prisma.content.findFirst({
      where: {
        OR: [{ id }, { contentId: id }],
      },
    });

    if (!content) {
      return NextResponse.json({ error: "Content item not found." }, { status: 404 });
    }

    if (content.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden. You do not own this content." }, { status: 403 });
    }

    await prisma.content.delete({
      where: { id: content.id },
    });

    return NextResponse.json({ success: true, message: "Content deleted successfully." });
  } catch (error: unknown) {
    console.error("Delete content error:", error);
    return NextResponse.json({ error: "Failed to delete content item." }, { status: 500 });
  }
}
