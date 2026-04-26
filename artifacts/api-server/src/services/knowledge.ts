import fs from "fs/promises";
import path from "path";
import { logger } from "../lib/logger";

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  source: string;
}

export class KnowledgeBase {
  private documents: KnowledgeDocument[] = [];
  private contextDir: string;

  constructor() {
    // Look for a 'context' directory in the project root or attached_assets
    this.contextDir = path.resolve(process.cwd(), "context");
  }

  async initialize() {
    try {
      // Ensure directory exists
      await fs.mkdir(this.contextDir, { recursive: true });
      
      const files = await fs.readdir(this.contextDir);
      for (const file of files) {
        if (file.endsWith(".txt") || file.endsWith(".md") || file.endsWith(".json")) {
          const filePath = path.join(this.contextDir, file);
          const content = await fs.readFile(filePath, "utf-8");
          this.documents.push({
            id: file,
            title: file,
            content,
            source: filePath
          });
        }
      }
      
      // Also check attached_assets for any large content files
      const assetsDir = path.resolve(process.cwd(), "attached_assets");
      try {
        const assets = await fs.readdir(assetsDir);
        for (const asset of assets) {
          if (asset.startsWith("content-") && asset.endsWith(".md")) {
             const filePath = path.join(assetsDir, asset);
             const content = await fs.readFile(filePath, "utf-8");
             this.documents.push({
               id: asset,
               title: "Newsletter Content Archive",
               content,
               source: filePath
             });
          }
        }
      } catch (e) {
        // assets dir might not exist in all environments
      }

      logger.info(`KnowledgeBase initialized with ${this.documents.length} documents.`);
    } catch (error) {
      logger.error({ error }, "Failed to initialize KnowledgeBase");
    }
  }

  /**
   * Simple keyword-based search for now.
   * For $100B SaaS, this would be a vector search using embeddings.
   */
  async search(query: string, limit = 3): Promise<string> {
    const queryLower = query.toLowerCase();
    const scores = this.documents.map(doc => {
      let score = 0;
      const terms = queryLower.split(/\s+/);
      for (const term of terms) {
        if (term.length < 3) continue;
        if (doc.content.toLowerCase().includes(term)) score += 1;
        if (doc.title.toLowerCase().includes(term)) score += 5;
      }
      return { doc, score };
    });

    const topDocs = scores
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => `[SOURCE: ${s.doc.title}]\n${s.doc.content.slice(0, 2000)}...`) // Truncate per doc to save context window
      .join("\n\n---\n\n");

    return topDocs;
  }
}

export const knowledgeBase = new KnowledgeBase();
// Initialize immediately
knowledgeBase.initialize();
