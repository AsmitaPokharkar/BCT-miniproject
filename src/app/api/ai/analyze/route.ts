/* eslint-disable */
import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "";
    const fileType = (formData.get("fileType") as string) || "";

    if (!file || !title) {
      return NextResponse.json({ error: "File and title are required." }, { status: 400 });
    }

    let result;
    
    if (fileType.startsWith("image/")) {
      result = await aiService.analyzeImage(file, title);
    } else if (fileType.startsWith("text/") || fileType === "application/pdf") {
      result = await aiService.analyzeDocument(file, title);
    } else if (fileType.startsWith("video/") || fileType.startsWith("audio/")) {
      result = await aiService.analyzeVideoAudio(file, title);
    } else {
      result = await aiService.analyzeDocument(file, title);
    }

    return NextResponse.json({
      success: true,
      analysis: result,
      isMockMode: aiService.isInMockMode(),
    });
  } catch (error: any) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze content." },
      { status: 500 }
    );
  }
}
