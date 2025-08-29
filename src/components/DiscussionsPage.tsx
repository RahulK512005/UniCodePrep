import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Separator } from "./ui/separator"
import { ScrollArea } from "./ui/scroll-area"
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User as UserIcon,
  Code, 
  BookOpen, 
  Search,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  Brain,
  Lightbulb,
  FileCode,
  MessageSquare,
  Tag,
  Filter
} from "lucide-react"
import { User } from '../utils/auth';

interface DiscussionsPageProps {
  currentUser: User;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
  type?: "text" | "code" | "explanation";
  codeLanguage?: string;
}

interface Discussion {
  id: string;
  title: string;
  category: "Algorithm" | "Data Structure" | "System Design" | "Debugging" | "Concept" | "Interview Prep";
  status: "active" | "resolved" | "archived";
  lastActivity: Date;
  messageCount: number;
  tags: string[];
  summary: string;
  messages: Message[]; // Store conversation history
}

const GEMINI_API_KEY = "YOUR_GOOGLE_API_KEY";

export default function DiscussionsPage({ currentUser }: DiscussionsPageProps) {
  const [currentInput, setCurrentInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeDiscussion, setActiveDiscussion] = useState<string | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample discussions data with message history
  const sampleDiscussions: Discussion[] = [
    {
      id: "1",
      title: "Binary Tree Traversal Confusion",
      category: "Data Structure",
      status: "active",
      lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
      messageCount: 8,
      tags: ["binary-tree", "traversal", "recursion"],
      summary: "Having trouble understanding inorder vs preorder traversal",
      messages: []
    },
    {
      id: "2", 
      title: "Dynamic Programming Approach",
      category: "Algorithm",
      status: "resolved",
      lastActivity: new Date(Date.now() - 86400000), // 1 day ago
      messageCount: 12,
      tags: ["dp", "optimization", "memoization"],
      summary: "Best practices for solving DP problems efficiently",
      messages: []
    },
    {
      id: "3",
      title: "Time Complexity Analysis",
      category: "Concept",
      status: "active",
      lastActivity: new Date(Date.now() - 1800000), // 30 minutes ago
      messageCount: 5,
      tags: ["big-o", "complexity", "analysis"],
      summary: "How to calculate time complexity for nested loops",
      messages: []
    }
  ];

  useEffect(() => {
    setDiscussions(sampleDiscussions);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const callGeminiAPI = async (prompt: string, conversationHistory: Message[] = []): Promise<string> => {
    try {
      // Check if API key is available
      if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
        throw new Error("Gemini API key not configured");
      }

      // Build conversation context from previous messages
      const conversationContext = conversationHistory.length > 0 ? 
        `Previous conversation context:\n${conversationHistory.slice(-6).map(msg => 
          `${msg.sender}: ${msg.content}`
        ).join('\n')}\n\n` : '';

      const contextPrompt = `You are an expert coding tutor and programming mentor for university students. Your role is to help clarify doubts, explain concepts, and guide students through problem-solving.

Context: You're helping a ${currentUser.user_type} named ${currentUser.userData?.name || currentUser.email.split('@')[0]} from ${currentUser.userData?.university || 'university'}.

${conversationContext}Current question/doubt: ${prompt}

Please provide responses in this format when applicable:

**EXPLANATION:**
[Provide clear conceptual explanation here]

**CODE EXAMPLE:** (if relevant)
\`\`\`language
// Explain each important line with comments
function example() {
    // This line does X because Y
    let variable = value; 
    // This loop iterates through Z for reason A
    for (let i = 0; i < n; i++) {
        // Critical logic here - explain the use case
        result += process(i);
    }
    return result; // Return statement significance
}
\`\`\`

**WHY THIS WORKS:**
[Explain the reasoning, algorithm choice, time/space complexity]

**USE CASES:**
[When to use this approach, common applications]

Please provide clear, educational responses that:
1. Break down complex concepts into understandable parts
2. Use examples and analogies when helpful
3. Encourage learning rather than just giving answers
4. Ask follow-up questions to ensure understanding
5. Provide detailed code comments explaining each line's purpose

Respond in a helpful, encouraging tone that promotes learning.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: contextPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1500,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error("Invalid response format from Gemini API");
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Provide a helpful fallback response based on the error
      if (error instanceof Error && error.message.includes("API key not configured")) {
        return "I'm currently operating in demo mode. While I can't access the live AI service right now, I'd be happy to help! Could you rephrase your question, and I'll do my best to provide guidance based on common programming patterns and best practices.";
      }
      
      // Provide educational fallback responses for common topics
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes("binary search")) {
        return `**EXPLANATION:**
Binary search is like looking up a word in a dictionary. Instead of starting from the beginning, you open to the middle page and compare.

**CODE EXAMPLE:**
\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1  # Initialize pointers at array bounds
    
    while left <= right:  # Continue until search space is exhausted
        mid = (left + right) // 2  # Find middle index (avoid overflow)
        
        if arr[mid] == target:  # Found the target
            return mid
        elif arr[mid] < target:  # Target is in right half
            left = mid + 1  # Eliminate left half
        else:  # Target is in left half
            right = mid - 1  # Eliminate right half
    
    return -1  # Target not found
\`\`\`

**WHY THIS WORKS:**
- Time Complexity: O(log n) - we eliminate half the search space each iteration
- Space Complexity: O(1) - only using a few variables

**USE CASES:**
Perfect for searching in sorted arrays, finding insertion points, or any scenario where you need to search efficiently in sorted data.

Would you like me to walk through a specific example or explain the code implementation in more detail?`;
      }
      
      if (lowerPrompt.includes("time complexity") || lowerPrompt.includes("big o")) {
        return `**EXPLANATION:**
Time complexity measures how an algorithm's runtime grows with input size. It helps us compare algorithm efficiency.

**COMMON COMPLEXITIES:**
- O(1): Constant - accessing array element
- O(log n): Logarithmic - binary search, balanced trees
- O(n): Linear - single loop through data
- O(n log n): Log-linear - efficient sorting algorithms
- O(n²): Quadratic - nested loops

**CODE EXAMPLE:**
\`\`\`python
# O(n²) - Nested loops example
for i in range(n):        # Outer loop runs n times
    for j in range(n):    # Inner loop runs n times for each i
        print(i, j)       # This executes n × n = n² times

# O(n) - Linear example  
for i in range(n):        # Loop runs exactly n times
    print(i)              # This executes n times total
\`\`\`

**WHY THIS MATTERS:**
Understanding complexity helps you choose the right algorithm and predict performance on large datasets.

What specific algorithm would you like me to analyze?`;
      }

      return "I apologize, but I'm having trouble connecting to the AI service right now. However, I'm still here to help! Could you rephrase your question or be more specific about what you're working on? I'll do my best to provide useful guidance.";
    }
  };

  const sendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: currentInput,
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput("");
    setIsTyping(true);

    try {
      // Pass conversation history for context
      const aiResponse = await callGeminiAPI(currentInput, messages);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: aiResponse,
        timestamp: new Date(),
        type: aiResponse.includes("```") ? "code" : "text"
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update discussion with new messages
      setDiscussions(prev => prev.map(discussion => {
        if (discussion.id === activeDiscussion) {
          return {
            ...discussion,
            messages: [...discussion.messages, userMessage, aiMessage],
            messageCount: discussion.messageCount + 2,
            lastActivity: new Date()
          };
        }
        return discussion;
      }));
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        type: "text"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const startNewDiscussion = () => {
    if (!newDiscussionTitle.trim()) return;

    const newDiscussion: Discussion = {
      id: Date.now().toString(),
      title: newDiscussionTitle,
      category: "Concept",
      status: "active",
      lastActivity: new Date(),
      messageCount: 0,
      tags: [],
      summary: "New discussion started",
      messages: []
    };

    setDiscussions(prev => [newDiscussion, ...prev]);
    setActiveDiscussion(newDiscussion.id);
    setMessages([]);
    setNewDiscussionTitle("");
    setShowNewDiscussion(false);

    // Add welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      sender: "ai",
      content: `Hello ${currentUser.userData?.name || currentUser.email.split('@')[0]}! I'm here to help you with "${newDiscussionTitle}". 

What specific aspect would you like to discuss? Feel free to:
• Ask conceptual questions
• Share code you're working on
• Request explanations of algorithms or data structures
• Get help with debugging
• Discuss problem-solving approaches

How can I assist you today?`,
      timestamp: new Date(),
      type: "text"
    };

    setMessages([welcomeMessage]);
    
    // Update the discussion with the welcome message
    setDiscussions(prev => prev.map(disc => 
      disc.id === newDiscussion.id 
        ? { ...disc, messages: [welcomeMessage], messageCount: 1 }
        : disc
    ));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(""), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || discussion.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Algorithm": "bg-blue-100 text-blue-700",
      "Data Structure": "bg-green-100 text-green-700",
      "System Design": "bg-purple-100 text-purple-700",
      "Debugging": "bg-red-100 text-red-700",
      "Concept": "bg-yellow-100 text-yellow-700",
      "Interview Prep": "bg-indigo-100 text-indigo-700"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "resolved": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "archived": return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getUserDisplayName = () => {
    return currentUser.userData?.name || currentUser.email.split('@')[0];
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Discussions List */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">My Discussions</h2>
            <Button
              size="sm"
              onClick={() => setShowNewDiscussion(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            <option value="Algorithm">Algorithm</option>
            <option value="Data Structure">Data Structure</option>
            <option value="System Design">System Design</option>
            <option value="Debugging">Debugging</option>
            <option value="Concept">Concept</option>
            <option value="Interview Prep">Interview Prep</option>
          </select>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredDiscussions.map((discussion) => (
              <Card
                key={discussion.id}
                className={`mb-2 cursor-pointer transition-colors ${
                  activeDiscussion === discussion.id 
                    ? "bg-primary/5 border-primary" 
                    : "hover:bg-muted/50"
                }`}
                onClick={() => {
                  setActiveDiscussion(discussion.id);
                  // Load messages for this discussion
                  const selectedDiscussion = discussions.find(d => d.id === discussion.id);
                  setMessages(selectedDiscussion?.messages || []);
                }}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm line-clamp-2">{discussion.title}</h3>
                    {getStatusIcon(discussion.status)}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`text-xs ${getCategoryColor(discussion.category)}`}>
                      {discussion.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {discussion.messageCount} messages
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {discussion.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {discussion.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-secondary text-secondary-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                      {discussion.tags.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{discussion.tags.length - 2}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(discussion.lastActivity)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {!activeDiscussion && !showNewDiscussion ? (
          // Welcome State
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">AI-Powered Doubt Clarification</h2>
              <p className="text-muted-foreground mb-6">
                Get instant help with coding concepts, algorithms, debugging, and more. 
                Start a new discussion or select an existing one to continue.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-500" />
                  <span>Code Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span>Concept Explanation</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>Debugging Help</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <span>Algorithm Guide</span>
                </div>
              </div>
              <Button
                onClick={() => setShowNewDiscussion(true)}
                className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start New Discussion
              </Button>
            </div>
          </div>
        ) : showNewDiscussion ? (
          // New Discussion Form
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Start New Discussion
                </CardTitle>
                <CardDescription>
                  Describe what you'd like help with
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Discussion Title</label>
                  <Input
                    placeholder="e.g., Understanding Binary Search Algorithm"
                    value={newDiscussionTitle}
                    onChange={(e) => setNewDiscussionTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        startNewDiscussion();
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={startNewDiscussion}
                    disabled={!newDiscussionTitle.trim()}
                    className="flex-1"
                  >
                    Start Discussion
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewDiscussion(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Active Discussion Chat
          <>
            {/* Chat Header */}
            <div className="border-b p-4 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    {discussions.find(d => d.id === activeDiscussion)?.title || "Discussion"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    AI Assistant • Always ready to help
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Online
                  </Badge>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.sender === "ai" && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-3 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className={`${message.type === "code" ? "font-mono text-sm" : ""}`}>
                        <pre className="whitespace-pre-wrap break-words">
                          {message.content}
                        </pre>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.sender === "ai" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(message.content)}
                            className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                          >
                            {copiedText === message.content ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {message.sender === "user" && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {currentUser.userData?.name?.charAt(0) || currentUser.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4 bg-card">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                <span>Powered by Gemini AI • Ask about code, algorithms, concepts, or debugging</span>
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Ask me anything about coding, algorithms, or computer science concepts..."
                  className="flex-1 min-h-[60px] max-h-32 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!currentInput.trim() || isTyping}
                  className="self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentInput("Can you explain how binary search works?")}
                >
                  Binary Search
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentInput("Help me debug this code:")}
                >
                  Debug Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentInput("What's the time complexity of this algorithm?")}
                >
                  Time Complexity
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
