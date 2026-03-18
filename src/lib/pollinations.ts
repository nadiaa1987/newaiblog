import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY;
const API_URL = "https://gen.pollinations.ai/v1/chat/completions";

export interface AIResponse {
  title: string;
  outline: string[];
  content: string;
  metaDescription: string;
  faq: { question: string; answer: string }[];
}

export const pollinations = {
  async generateText(prompt: string, model: string = "openai") {
    try {
      const response = await axios.post(
        API_URL,
        {
          model,
          messages: [
            {
              role: "system",
              content: "You are a professional SEO content writer and strategist.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Pollinations Text Generation Error:", error);
      throw error;
    }
  },

  async generateImage(prompt: string, options: { width?: number; height?: number; seed?: number } = {}) {
    const { width = 1024, height = 768, seed = Math.floor(Math.random() * 1000000) } = options;
    const encodedPrompt = encodeURIComponent(prompt);
    return `https://pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;
  },

  async generateArticle(keyword: string, niche: string, language: string = "English") {
    const prompt = `
      Write a comprehensive SEO-optimized article in ${language} for the niche "${niche}" about the keyword "${keyword}".
      The article should be between 1500 and 2500 words.
      Include:
      1. A catchy SEO title.
      2. A clear outline with H2 and H3 headings.
      3. The full article content with semantic HTML (use <h2>, <h3>, <p>, <ul>, <li>, <strong>).
      4. A meta description (max 160 characters).
      5. Internal linking suggestions (placeholders like [[LINK:topic]]).
      6. A FAQ section with at least 5 questions and answers.
      7. Optimized headings for search engines.
      
      Return the result in a JSON format with the following keys:
      "title", "outline" (array of strings), "content" (HTML string), "metaDescription", "faq" (array of {question, answer} objects).
    `;

    const response = await this.generateText(prompt);
    try {
      // Attempt to parse JSON from the response
      const jsonStr = response.match(/\{[\s\S]*\}/)?.[0] || response;
      return JSON.parse(jsonStr) as AIResponse;
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", response);
      // Fallback: return raw response if parsing fails
      return {
        title: keyword,
        outline: [],
        content: response,
        metaDescription: "",
        faq: [],
      };
    }
  },

  async clusterKeywords(keywords: string[]) {
    const prompt = `
      Cluster the following keywords into relevant topics or categories.
      Keywords: ${keywords.join(", ")}
      
      Return the result as a JSON object where keys are topic names and values are arrays of keywords.
    `;

    const response = await this.generateText(prompt);
    try {
      const jsonStr = response.match(/\{[\s\S]*\}/)?.[0] || response;
      return JSON.parse(jsonStr) as Record<string, string[]>;
    } catch (e) {
      console.error("Failed to parse clustering response:", response);
      return { "General": keywords };
    }
  }
};
