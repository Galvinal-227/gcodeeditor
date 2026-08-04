class PuterService {
  private history: { role: string; content: string }[] = [];
  private totalTokens: number = 0;
  private maxTokens: number = 10000;
  private isAvailable: boolean = false;

  constructor() {
    this.checkAvailability();
  }

  checkAvailability() {
    this.isAvailable = typeof window !== 'undefined' && !!(window as any).puter?.ai;
    if (!this.isAvailable) {
      console.warn('Puter AI not available. Make sure Puter SDK is loaded.');
    }
    return this.isAvailable;
  }

  reset() {
    this.history = [];
    this.totalTokens = 0;
  }

  getRemainingTokens() {
    return this.maxTokens - this.totalTokens;
  }

  isReady() {
    return this.isAvailable;
  }

  private getSystemPrompt(): string {
    return `You are AetherCode, a senior web developer with 10+ years of experience.

PERSONALITY:
- You are a mentor and expert in web development
- You write clean, production-ready code
- You follow best practices and modern standards
- You are patient and explain things clearly
- You think like a senior engineer solving real problems

SPECIALIZATION:
- HTML5 (semantic, accessible, SEO-friendly)
- CSS3 (Flexbox, Grid, animations, responsive design)
- JavaScript (ES6+, vanilla, DOM manipulation, async/await)
- Performance optimization
- Cross-browser compatibility
- Web accessibility (WCAG)
- Clean code and design patterns

RULES:
1. ONLY help with HTML, CSS, and JavaScript.
2. If asked about React, TypeScript, Python, or other languages: "Maaf, saya spesialis HTML, CSS, dan JavaScript. Saya tidak bisa membantu dengan [language]."
3. For code: output ONLY the code, NO explanations.
4. For explanations: be concise, clear, and professional.
5. Use comments in code only when necessary.
6. Keep responses under 150 words unless asked for more.

CODE QUALITY STANDARDS:
- Semantic HTML
- BEM or meaningful CSS class names
- Clean, readable JavaScript with proper naming
- Responsive by default
- Accessible (aria labels, semantic elements)
- Performance optimized

EXAMPLE GOOD RESPONSE:
\`\`\`html
<button class="btn-primary" aria-label="Submit form">
  Submit
</button>
\`\`\`

EXAMPLE BAD RESPONSE:
"Here is a button for you. You can use it..."

Remember: You are a senior web developer. Write code like you're building for production.`;
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('Puter AI is not available. Please make sure you are running in Puter environment.');
    }

    try {
      const response = await (window as any).puter.ai.chat(
        [
          {
            role: "system",
            content: this.getSystemPrompt()
          },
          ...this.history,
          {
            role: "user",
            content: message
          }
        ],
        {
          model: "gpt-5.4-nano"
        }
      );

      const text = response.message.content;

      this.history.push({
        role: "user",
        content: message
      });

      this.history.push({
        role: "assistant",
        content: text
      });

      if (this.history.length > 20) {
        this.history = this.history.slice(-20);
      }

      this.totalTokens += Math.ceil((message.length + text.length) / 4);

      return text;
    } catch (error) {
      console.error('Error sending message to Puter AI:', error);
      throw error;
    }
  }

  async sendMessageStream(
    message: string, 
    onChunk: (chunk: string) => void, 
    onComplete: (result: { text: string; remainingTokens: number }) => void
  ): Promise<void> {
    if (!this.isAvailable) {
      throw new Error('Puter AI is not available. Please make sure you are running in Puter environment.');
    }

    try {
      const stream = await (window as any).puter.ai.chat(
        [
          {
            role: "system",
            content: this.getSystemPrompt()
          },
          ...this.history,
          {
            role: "user",
            content: message
          }
        ],
        {
          model: "gpt-5.4-nano",
          stream: true
        }
      );

      let fullText = "";

      for await (const part of stream) {
        if (part?.text) {
          fullText += part.text;
          onChunk(part.text);
        }
      }

      this.history.push({
        role: "user",
        content: message
      });

      this.history.push({
        role: "assistant",
        content: fullText
      });

      if (this.history.length > 20) {
        this.history = this.history.slice(-20);
      }

      this.totalTokens += Math.ceil((message.length + fullText.length) / 4);

      onComplete({
        text: fullText,
        remainingTokens: this.getRemainingTokens()
      });
    } catch (error) {
      console.error('Error in stream:', error);
      throw error;
    }
  }

  async generateCode(prompt: string, lang: string = 'html'): Promise<string> {
    const supportedLanguages = ['html', 'css', 'javascript', 'js'];
    const langLower = lang.toLowerCase();
    
    if (!supportedLanguages.includes(langLower)) {
      return `Maaf, saya spesialis HTML, CSS, dan JavaScript. Saya tidak bisa membantu dengan ${lang}.`;
    }
    
    // Map language to proper name
    const langMap: Record<string, string> = {
      'html': 'HTML',
      'css': 'CSS',
      'javascript': 'JavaScript',
      'js': 'JavaScript'
    };
    
    const fullPrompt = `As a senior web developer, write production-ready ${langMap[langLower] || lang} code for: ${prompt}. Output ONLY the code.`;
    return await this.sendMessage(fullPrompt);
  }

  async explainCode(code: string): Promise<string> {
    const fullPrompt = `As a senior developer, explain this code concisely (max 100 words):\n\n${code}`;
    return await this.sendMessage(fullPrompt);
  }

  async fixCode(code: string, error: string): Promise<string> {
    const fullPrompt = `As a senior developer, fix this code:\n\n${code}\n\nError: ${error}\n\nOutput ONLY the fixed code with minimal comments.`;
    return await this.sendMessage(fullPrompt);
  }

  async reviewCode(code: string): Promise<string> {
    const fullPrompt = `As a senior developer, review this code. Give concise feedback on:\n- What's good\n- What needs improvement\n- Best practices\n\nCode:\n${code}\n\nKeep it brief (max 150 words).`;
    return await this.sendMessage(fullPrompt);
  }

  async optimizeCode(code: string): Promise<string> {
    const fullPrompt = `As a senior developer, optimize this code for performance and readability. Output ONLY the optimized code:\n\n${code}`;
    return await this.sendMessage(fullPrompt);
  }
}

// Export singleton instance
const puterService = new PuterService();
export default puterService;