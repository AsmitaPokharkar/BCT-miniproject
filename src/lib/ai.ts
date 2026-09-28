interface AIAnalysisResult {
  description?: string;
  summary?: string;
  tags?: string;
  suggestedCategory?: string;
  keywords?: string;
  confidence?: number;
}

class AIService {
  private apiKey: string;
  private apiUrl: string;
  private isMockMode: boolean;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
    this.apiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
    this.isMockMode = !this.apiKey;
  }

  async analyzeImage(file: File, title: string): Promise<AIAnalysisResult> {
    if (this.isMockMode) {
      return this.mockAnalyzeImage(file, title);
    }

    try {
      // Convert image to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this image titled "${title}". Provide:
1. A concise description (max 100 words)
2. 5-10 relevant visual tags (comma-separated)
3. A suggested category (Artwork, Photography, Design, Illustration, etc.)
4. 5-10 searchable keywords (comma-separated)
Return as JSON with keys: description, tags, suggestedCategory, keywords`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: dataUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);

      return {
        description: parsed.description,
        tags: parsed.tags,
        suggestedCategory: parsed.suggestedCategory,
        keywords: parsed.keywords,
        confidence: 0.85,
      };
    } catch (error) {
      console.error("AI image analysis error:", error);
      return this.mockAnalyzeImage(file, title);
    }
  }

  async analyzeDocument(file: File, title: string): Promise<AIAnalysisResult> {
    if (this.isMockMode) {
      return this.mockAnalyzeDocument(file, title);
    }

    try {
      const text = await this.extractTextFromFile(file);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: `Analyze this document titled "${title}" with the following text:\n\n${text.substring(0, 10000)}\n\nProvide:
1. A summary (max 150 words)
2. 5-10 relevant tags
3. A suggested category (Document, Research, Report, Article, etc.)
4. 5-10 keywords
Return as JSON with keys: summary, tags, suggestedCategory, keywords`,
            },
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);

      return {
        summary: parsed.summary,
        tags: parsed.tags,
        suggestedCategory: parsed.suggestedCategory,
        keywords: parsed.keywords,
        confidence: 0.85,
      };
    } catch (error) {
      console.error("AI document analysis error:", error);
      return this.mockAnalyzeDocument(file, title);
    }
  }

  async analyzeVideoAudio(file: File, title: string): Promise<AIAnalysisResult> {
    if (this.isMockMode) {
      return this.mockAnalyzeVideoAudio(file, title);
    }

    // For video/audio, use metadata since transcription is expensive
    return this.mockAnalyzeVideoAudio(file, title);
  }

  private async extractTextFromFile(file: File): Promise<string> {
    // Simple text extraction for text-based files
    if (file.type === "text/plain" || file.type === "application/json") {
      const text = await file.text();
      return text;
    }
    // For PDFs and other formats, would need specialized libraries
    // Returning placeholder for now
    return `[Document content from ${file.name}]`;
  }

  private mockAnalyzeImage(file: File, title: string): AIAnalysisResult {
    const categories = ["Artwork", "Photography", "Design", "Illustration", "Digital Art"];
    const tags = ["creative", "visual", "digital", "artistic", "modern", "colorful", "abstract", "detailed"];
    
    return {
      description: `A ${categories[Math.floor(Math.random() * categories.length)].toLowerCase()} titled "${title}" with creative visual elements and artistic composition.`,
      tags: tags.sort(() => Math.random() - 0.5).slice(0, 6).join(", "),
      suggestedCategory: categories[Math.floor(Math.random() * categories.length)],
      keywords: tags.sort(() => Math.random() - 0.5).slice(0, 5).join(", "),
      confidence: 0.75,
    };
  }

  private mockAnalyzeDocument(file: File, title: string): AIAnalysisResult {
    const categories = ["Document", "Research", "Report", "Article", "Paper"];
    const tags = ["informative", "detailed", "professional", "comprehensive", "well-structured"];
    
    return {
      summary: `A document titled "${title}" containing informative content with professional structure and comprehensive coverage of the subject matter.`,
      tags: tags.sort(() => Math.random() - 0.5).slice(0, 5).join(", "),
      suggestedCategory: categories[Math.floor(Math.random() * categories.length)],
      keywords: tags.sort(() => Math.random() - 0.5).slice(0, 5).join(", "),
      confidence: 0.75,
    };
  }

  private mockAnalyzeVideoAudio(file: File, title: string): AIAnalysisResult {
    const categories = ["Video", "Audio", "Animation", "Presentation", "Tutorial"];
    const tags = ["multimedia", "engaging", "informative", "creative", "professional"];
    
    return {
      summary: `A ${categories[Math.floor(Math.random() * categories.length)].toLowerCase()} titled "${title}" with engaging multimedia content.`,
      tags: tags.sort(() => Math.random() - 0.5).slice(0, 5).join(", "),
      suggestedCategory: categories[Math.floor(Math.random() * categories.length)],
      keywords: tags.sort(() => Math.random() - 0.5).slice(0, 5).join(", "),
      confidence: 0.75,
    };
  }

  isInMockMode(): boolean {
    return this.isMockMode;
  }
}

export const aiService = new AIService();
