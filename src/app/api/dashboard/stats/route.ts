import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    // 1. Total registered works
    const totalWorks = await prisma.content.count({
      where: { ownerId: user.id },
    });

    // 2. Verified works on blockchain
    const verifiedWorks = await prisma.content.count({
      where: {
        ownerId: user.id,
        blockchainRecord: {
          status: "CONFIRMED",
        },
      },
    });

    // 3. Total verifications performed across user's works
    const userContents = await prisma.content.findMany({
      where: { ownerId: user.id },
      select: { contentId: true, fileSize: true },
    });

    const contentIds = userContents.map((c) => c.contentId);
    const totalVerifications = await prisma.verification.count({
      where: {
        contentId: { in: contentIds },
      },
    });

    // 4. Storage usage
    const totalStorageBytes = userContents.reduce((acc, item) => acc + (item.fileSize || 0), 0);

    // 5. Recent registrations
    const recentRegistrations = await prisma.content.findMany({
      where: { ownerId: user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        blockchainRecord: true,
        _count: { select: { verifications: true } },
      },
    });

    // 6. Verification activity chart data (last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));

      const count = await prisma.verification.count({
        where: {
          contentId: { in: contentIds },
          verifiedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      chartData.push({
        date: dateStr,
        verifications: count,
      });
    }

    // 7. Content category distribution
    const categoryData = await prisma.content.groupBy({
      by: ["category"],
      where: { ownerId: user.id },
      _count: {
        category: true,
      },
    });

    const categoryDistribution = categoryData.map((item) => ({
      category: item.category,
      count: item._count.category,
    }));

    // 8. Successful vs failed verifications
    const successfulVerifications = await prisma.verification.count({
      where: {
        contentId: { in: contentIds },
        result: "VERIFIED_AUTHENTIC",
      },
    });

    const failedVerifications = await prisma.verification.count({
      where: {
        contentId: { in: contentIds },
        result: "VERIFICATION_FAILED",
      },
    });

    // 9. Recent blockchain transactions
    const recentBlockchainTx = await prisma.blockchainRecord.findMany({
      where: {
        content: { ownerId: user.id },
      },
      take: 5,
      orderBy: { registeredAt: "desc" },
      include: {
        content: {
          select: {
            contentId: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalWorks,
        verifiedWorks,
        totalVerifications,
        totalStorageBytes,
        successfulVerifications,
        failedVerifications,
      },
      recentRegistrations,
      chartData,
      categoryDistribution,
      recentBlockchainTx,
    });
  } catch (error: unknown) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to load dashboard statistics." }, { status: 500 });
  }
}
