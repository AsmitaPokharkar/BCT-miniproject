/* eslint-disable */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface AssistantRequest {
  contentId: string;
  question: string;
}

export async function POST(request: Request) {
  try {
    const { contentId, question }: AssistantRequest = await request.json();

    if (!contentId || !question) {
      return NextResponse.json({ error: "Content ID and question are required." }, { status: 400 });
    }

    // Retrieve content with all related data (RAG-style retrieval)
    const content = await (prisma as any).content.findFirst({
      where: {
        OR: [
          { contentId: contentId },
          { id: contentId },
          { sha256Hash: contentId },
        ],
      },
      include: {
        owner: { select: { name: true } },
        blockchainRecord: true,
        aiAnalysis: true,
        verifications: {
          orderBy: { verifiedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found." }, { status: 404 });
    }

    // Build context from retrieved data
    const context = {
      contentId: content.contentId,
      title: content.title,
      description: content.description,
      category: content.category,
      tags: content.tags,
      creatorName: content.creatorName,
      fileName: content.fileName,
      fileType: content.fileType,
      fileSize: content.fileSize,
      sha256Hash: content.sha256Hash,
      status: content.status,
      createdAt: content.createdAt,
      ownerName: content.owner?.name,
      blockchainRecord: content.blockchainRecord ? {
        transactionHash: content.blockchainRecord.transactionHash,
        blockchainNetwork: content.blockchainRecord.blockchainNetwork,
        blockNumber: content.blockchainRecord.blockNumber,
        contractAddress: content.blockchainRecord.contractAddress,
        status: content.blockchainRecord.status,
        ipfsMetadataCid: content.blockchainRecord.ipfsMetadataCid,
        registeredAt: content.blockchainRecord.registeredAt,
      } : null,
      aiAnalysis: content.aiAnalysis ? {
        description: content.aiAnalysis.description,
        summary: content.aiAnalysis.summary,
        tags: content.aiAnalysis.tags,
        suggestedCategory: content.aiAnalysis.suggestedCategory,
        keywords: content.aiAnalysis.keywords,
      } : null,
      verificationCount: content.verifications.length,
      lastVerifiedAt: content.verifications[0]?.verifiedAt,
    };

    // Check if AI API is available
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";

    if (!apiKey) {
      // Fallback to simple rule-based responses
      return NextResponse.json({
        success: true,
        answer: generateFallbackAnswer(question, context),
        context,
        isMockMode: true,
      });
    }

    // Call LLM with strict context
    const systemPrompt = `You are a helpful assistant for CreatorProof, a blockchain-based content verification platform. 
You must answer questions ONLY using the provided context data. 
Do not invent information. Do not make assumptions beyond the given context.
If the information is not available in the context, say "I don't have that information."
Be concise and factual.`;

    const userPrompt = `Context about the content:
${JSON.stringify(context, null, 2)}

User question: ${question}

Answer the question based ONLY on the provided context.`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return NextResponse.json({
      success: true,
      answer,
      context,
      isMockMode: false,
    });
  } catch (error: any) {
    console.error("AI assistant error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process question." },
      { status: 500 }
    );
  }
}

function generateFallbackAnswer(question: string, context: any): string {
  const q = question.toLowerCase();

  if (q.includes("who") && q.includes("register")) {
    return `This content was registered by ${context.creatorName || context.ownerName || "an anonymous creator"}.`;
  }

  if (q.includes("when") && q.includes("register")) {
    return `This content was registered on ${new Date(context.createdAt).toLocaleDateString()}.`;
  }

  if (q.includes("authentic") || q.includes("verify")) {
    if (context.blockchainRecord?.status === "CONFIRMED") {
      return `Yes, this content is verified authentic on the blockchain. It is registered on ${context.blockchainRecord.blockchainNetwork} at block #${context.blockchainRecord.blockNumber}.`;
    }
    return `The verification status is: ${context.status}.`;
  }

  if (q.includes("about") || q.includes("describe")) {
    if (context.aiAnalysis?.description) {
      return context.aiAnalysis.description;
    }
    return context.description || `This is a ${context.category} titled "${context.title}".`;
  }

  if (q.includes("hash") || q.includes("sha")) {
    return `The SHA-256 hash is: ${context.sha256Hash}`;
  }

  if (q.includes("transaction") || q.includes("blockchain")) {
    if (context.blockchainRecord) {
      return `Transaction hash: ${context.blockchainRecord.transactionHash}. Block: #${context.blockchainRecord.blockNumber}. Network: ${context.blockchainRecord.blockchainNetwork}`;
    }
    return "No blockchain record found for this content.";
  }

  return "I don't have that information in the current context.";
}
