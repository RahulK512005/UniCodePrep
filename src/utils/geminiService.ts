interface SearchResults {
  youtube_urls: Array<{ url: string; title: string }>;
  google_urls: Array<{ url: string; title: string }>;
}

interface GenerativeResponse {
  text: string;
}

class GeminiService {
  private static instance: GeminiService;
  private apiKey: string | null = null;

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  constructor() {
    // For demo purposes, we'll use a placeholder API key
    // In a real app, you would get this from your environment variables
    // or from a secure configuration service
    this.apiKey = 'demo_gemini_api_key';
  }

  // Main method for generating AI content
  async generateContent(prompt: string): Promise<GenerativeResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // In a real implementation, this would call the actual Gemini API
      // For demo purposes, we'll generate mock responses based on the prompt
      const mockResponse = this.generateMockContent(prompt);
      
      console.log(`Gemini API Content Generation for: "${prompt.substring(0, 100)}..."`);
      console.log('Generated Response:', mockResponse);
      
      return { text: mockResponse };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate content');
    }
  }

  private generateMockContent(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();

    // Generate interview questions based on type
    if (lowerPrompt.includes('generate') && lowerPrompt.includes('interview question')) {
      if (lowerPrompt.includes('behavioral')) {
        const behavioralQuestions = [
          "Tell me about a time when you had to work with a difficult team member. How did you handle the situation and what was the outcome?",
          "Describe a situation where you had to meet a tight deadline. How did you prioritize your tasks and ensure quality?",
          "Give me an example of a time when you had to learn a new technology quickly. What was your approach?",
          "Tell me about a project you're most proud of. What made it successful and what was your specific contribution?",
          "Describe a time when you received constructive criticism. How did you handle it and what did you learn?",
          "Tell me about a time when you had to resolve a conflict between team members. What steps did you take?",
          "Describe a situation where you had to take initiative without being asked. What was the result?"
        ];
        return behavioralQuestions[Math.floor(Math.random() * behavioralQuestions.length)];
      }
      
      if (lowerPrompt.includes('situational')) {
        const situationalQuestions = [
          "How would you handle a situation where you disagree with your manager's technical decision?",
          "If you were assigned a project with unclear requirements, how would you proceed?",
          "How would you approach debugging a critical production issue under time pressure?",
          "If you had to choose between meeting a deadline and ensuring code quality, how would you decide?",
          "How would you handle a situation where a team member is not contributing effectively to the project?",
          "If you discovered a major security vulnerability in production code, what would be your immediate steps?",
          "How would you manage competing priorities when multiple stakeholders have urgent requests?"
        ];
        return situationalQuestions[Math.floor(Math.random() * situationalQuestions.length)];
      }
      
      if (lowerPrompt.includes('technical')) {
        const technicalQuestions = [
          "Design a system that can handle real-time messaging between millions of users. What technologies and architecture would you use?",
          "How would you implement a rate limiting system for an API that serves thousands of requests per second?",
          "Explain how you would design a caching strategy for a high-traffic e-commerce website.",
          "How would you architect a microservices system for a social media platform?",
          "Design a database schema for a content management system that supports multiple content types and user permissions.",
          "How would you implement a distributed search engine that can index billions of documents?",
          "Design a load balancing system for a web application with global users."
        ];
        return technicalQuestions[Math.floor(Math.random() * technicalQuestions.length)];
      }
    }

    // Generate interview response evaluations
    if (lowerPrompt.includes('evaluate') && (lowerPrompt.includes('response') || lowerPrompt.includes('interview'))) {
      const responses = [
        `Score: ${60 + Math.floor(Math.random() * 40)}
Feedback: Your response demonstrates good understanding of the concept and shows practical experience. The structure is clear and you provide specific examples which is excellent for interview responses.
Strengths:
- Provided concrete examples from your experience
- Demonstrated problem-solving approach
- Showed clear communication skills
Improvements:
- Consider elaborating more on the specific outcomes achieved
- Include metrics or measurable results where possible`,

        `Score: ${70 + Math.floor(Math.random() * 30)}
Feedback: Strong response that covers the key aspects of the question. You show good technical knowledge and the ability to think systematically about problems.
Strengths:
- Well-structured approach to the problem
- Good technical understanding
- Clear explanation of your thought process
Improvements:
- Add more details about alternative solutions considered
- Discuss potential challenges and how to overcome them`,

        `Score: ${50 + Math.floor(Math.random() * 40)}
Feedback: Good foundation but could benefit from more specific details and examples. Your approach is sound but needs more depth to fully demonstrate your capabilities.
Strengths:
- Correct understanding of the basic concepts
- Logical approach to problem-solving
Improvements:
- Provide more specific examples from your experience
- Elaborate on the implementation details
- Discuss lessons learned and how you would improve`,

        `Score: ${80 + Math.floor(Math.random() * 20)}
Feedback: Excellent response! You demonstrated comprehensive understanding and provided detailed, well-structured answers with concrete examples.
Strengths:
- Comprehensive coverage of all key aspects
- Specific examples with measurable outcomes
- Clear communication and logical flow
Improvements:
- Consider discussing potential risks or edge cases
- Mention how you would scale or improve the solution`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Default fallback response
    return "I understand your request. Let me provide you with a thoughtful response based on best practices in software engineering and interview preparation.";
  }

  async generateSearchResults(keyword: string): Promise<SearchResults> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // In a real implementation, this would call the actual Gemini API
      // For demo purposes, we'll generate mock results based on the keyword
      const mockResults = this.generateMockResults(keyword);
      
      console.log(`Gemini API Search for: "${keyword}"`);
      console.log('Generated Results:', mockResults);
      
      return mockResults;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate search results');
    }
  }

  private generateMockResults(keyword: string): SearchResults {
    // Create realistic YouTube search URLs
    const youtubeSearchQuery = keyword.replace(/\s+/g, '+');
    const googleSearchQuery = keyword.replace(/\s+/g, '+');

    const youtube_urls = [
      {
        url: `https://www.youtube.com/results?search_query=${youtubeSearchQuery}+tutorial`,
        title: `${keyword} - Complete Tutorial Explained`
      },
      {
        url: `https://www.youtube.com/results?search_query=${youtubeSearchQuery}+leetcode+solution`,
        title: `${keyword} LeetCode Solution Walkthrough`
      },
      {
        url: `https://www.youtube.com/results?search_query=${youtubeSearchQuery}+algorithm+explanation`,
        title: `${keyword} Algorithm Visualization & Explanation`
      }
    ];

    const google_urls = [
      {
        url: `https://www.google.com/search?q=${googleSearchQuery}+algorithm+tutorial+geeksforgeeks`,
        title: `${keyword} Algorithm Tutorial - GeeksforGeeks`
      },
      {
        url: `https://www.google.com/search?q=${googleSearchQuery}+practice+problems+leetcode`,
        title: `${keyword} Practice Problems - LeetCode`
      },
      {
        url: `https://www.google.com/search?q=${googleSearchQuery}+interview+questions`,
        title: `${keyword} Technical Interview Questions`
      }
    ];

    return { youtube_urls, google_urls };
  }

  // Method to set API key (for when you have a real API key)
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  // Method for actual Gemini API integration (commented for demo)
  /*
  private async callGeminiAPI(prompt: string): Promise<string> {
    if (!this.apiKey || this.apiKey === 'demo_gemini_api_key') {
      throw new Error('Valid Gemini API key not configured');
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private async generateRealSearchResults(keyword: string): Promise<SearchResults> {
    const youtubePrompt = `Generate 3 YouTube search URLs for tutorials on "${keyword}" related to coding problems, algorithms, or LeetCode solutions. Format as: https://www.youtube.com/results?search_query=...`;
    const googlePrompt = `Generate 3 Google search URLs for articles or tutorials on "${keyword}" related to coding problems, algorithms, or LeetCode solutions. Format as: https://www.google.com/search?q=...`;

    try {
      const [youtubeResponse, googleResponse] = await Promise.all([
        this.callGeminiAPI(youtubePrompt),
        this.callGeminiAPI(googlePrompt)
      ]);

      const youtubeUrls = this.parseSearchUrls(youtubeResponse, 'youtube');
      const googleUrls = this.parseSearchUrls(googleResponse, 'google');

      return {
        youtube_urls: youtubeUrls,
        google_urls: googleUrls
      };
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Fallback to mock results
      return this.generateMockResults(keyword);
    }
  }

  private parseSearchUrls(response: string, type: 'youtube' | 'google'): Array<{ url: string; title: string }> {
    const lines = response.split('\n').filter(line => line.trim());
    const urls: Array<{ url: string; title: string }> = [];

    for (const line of lines) {
      const urlMatch = line.match(/https:\/\/[^\s]+/);
      if (urlMatch) {
        const url = urlMatch[0];
        let title = line.replace(url, '').trim();
        
        if (!title) {
          title = type === 'youtube' 
            ? `YouTube Tutorial: ${url.split('=')[1]?.replace(/\+/g, ' ') || 'Video'}`
            : `Resource: ${url.split('q=')[1]?.replace(/\+/g, ' ') || 'Article'}`;
        }

        urls.push({ url, title });
        
        if (urls.length >= 3) break;
      }
    }

    return urls;
  }
  */
}

// Create and export the service instance
const geminiService = GeminiService.getInstance();

export { geminiService, type SearchResults, type GenerativeResponse };