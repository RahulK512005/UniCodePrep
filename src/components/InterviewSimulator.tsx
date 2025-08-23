import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  MessageSquare,
  Send,
  User,
  Bot,
  Star,
  Trophy,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Brain,
  Target,
  Users,
  Code2,
  Loader2,
  TrendingUp,
  Award,
  X,
  Play,
} from "lucide-react";
import { User as AuthUser } from "../utils/auth";
import { geminiService } from "../utils/geminiService";
import { toast } from "sonner@2.0.3";

interface InterviewSimulatorProps {
  currentUser: AuthUser;
}

type InterviewType = "behavioral" | "situational" | "technical";

interface InterviewQuestion {
  id: string;
  type: InterviewType;
  question: string;
  category: string;
}

interface Feedback {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface InterviewSession {
  type: InterviewType | null;
  currentQuestion: InterviewQuestion | null;
  questions: InterviewQuestion[];
  responses: Array<{
    question: InterviewQuestion;
    response: string;
    feedback: Feedback;
  }>;
  overallScore: number;
  isComplete: boolean;
  isStarted: boolean;
}

const interviewCategories = {
  behavioral: [
    "Teamwork",
    "Leadership",
    "Conflict Resolution",
    "Communication",
    "Problem Solving",
  ],
  situational: [
    "Decision Making",
    "Prioritization",
    "Resource Management",
    "Stakeholder Management",
    "Crisis Management",
  ],
  technical: [
    "System Design",
    "Algorithm Design",
    "Architecture",
    "Scalability",
    "Database Design",
  ],
};

const interviewTypes = [
  {
    id: 'behavioral' as InterviewType,
    title: 'Behavioral Interview',
    description: 'Past experiences that demonstrate your skills and personality',
    duration: '30-45 minutes',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    id: 'situational' as InterviewType,
    title: 'Situational Interview',
    description: 'Hypothetical scenarios to assess problem-solving skills',
    duration: '25-40 minutes',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    id: 'technical' as InterviewType,
    title: 'Technical Interview',
    description: 'System design and technical problem-solving questions',
    duration: '45-60 minutes',
    icon: Code2,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  }
];

export default function InterviewSimulator({
  currentUser,
}: InterviewSimulatorProps) {
  const [session, setSession] = useState<InterviewSession>({
    type: null,
    currentQuestion: null,
    questions: [],
    responses: [],
    overallScore: 0,
    isComplete: false,
    isStarted: false,
  });

  const [selectedType, setSelectedType] =
    useState<InterviewType>("behavioral");
  const [currentResponse, setCurrentResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] =
    useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);

  // Generate question using Gemini API
  const generateQuestion = async (
    type: InterviewType,
  ): Promise<InterviewQuestion> => {
    setIsGeneratingQuestion(true);

    try {
      // Debug logging
      console.log("GeminiService:", geminiService);
      console.log(
        "GenerateContent method:",
        typeof geminiService.generateContent,
      );

      const category =
        interviewCategories[type][
          Math.floor(
            Math.random() * interviewCategories[type].length,
          )
        ];

      let prompt = "";
      switch (type) {
        case "behavioral":
          prompt = `Generate a single behavioral interview question for a software engineering candidate focusing on ${category}. The question should ask about a specific past experience and be clear and professional. Only return the question text, nothing else.`;
          break;
        case "situational":
          prompt = `Generate a single situational interview question for a software engineering candidate focusing on ${category}. The question should present a hypothetical scenario and ask how they would handle it. Only return the question text, nothing else.`;
          break;
        case "technical":
          prompt = `Generate a single technical interview question for a software engineering candidate focusing on ${category}. The question should test their technical knowledge and problem-solving skills. Only return the question text, nothing else.`;
          break;
      }

      if (
        !geminiService ||
        typeof geminiService.generateContent !== "function"
      ) {
        throw new Error(
          "GeminiService is not properly initialized",
        );
      }

      const response =
        await geminiService.generateContent(prompt);
      const questionText = response.text
        .trim()
        .replace(/^["']|["']$/g, ""); // Remove quotes if present

      return {
        id: `${type}-${Date.now()}`,
        type,
        question: questionText,
        category,
      };
    } catch (error) {
      console.error("Error generating question:", error);
      // Fallback questions
      const fallbackQuestions = {
        behavioral:
          "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
        situational:
          "If you were assigned a project with a tight deadline and limited resources, how would you approach it?",
        technical:
          "How would you design a simple chat application that can handle thousands of concurrent users?",
      };

      return {
        id: `${type}-fallback-${Date.now()}`,
        type,
        question: fallbackQuestions[type],
        category: interviewCategories[type][0],
      };
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  // Evaluate response using Gemini API
  const evaluateResponse = async (
    question: InterviewQuestion,
    userResponse: string,
  ): Promise<Feedback> => {
    try {
      if (
        !geminiService ||
        typeof geminiService.generateContent !== "function"
      ) {
        throw new Error(
          "GeminiService is not properly initialized",
        );
      }

      const rubric = `Evaluate this ${question.type} interview response for a software engineering candidate. 
      
Question: ${question.question}
Response: ${userResponse}

Please evaluate based on:
- Clarity and structure of response
- Specific examples and details provided
- Problem-solving approach demonstrated
- Communication skills
- Technical accuracy/relevance (for technical questions)
- Leadership and teamwork skills (for behavioral questions)

Provide a score from 0-100 and detailed feedback including:
1. Overall feedback (2-3 sentences)
2. Specific strengths (list 2-3 bullet points)
3. Areas for improvement (list 2-3 bullet points)

Format your response as:
Score: [number]
Feedback: [overall feedback]
Strengths:
- [strength 1]
- [strength 2]
Improvements:
- [improvement 1]
- [improvement 2]`;

      const response =
        await geminiService.generateContent(rubric);
      const evaluation = response.text;

      // Parse the response
      const scoreMatch = evaluation.match(/Score:\s*(\d+)/i);
      const score = scoreMatch
        ? Math.min(100, Math.max(0, parseInt(scoreMatch[1])))
        : 50;

      const feedbackMatch = evaluation.match(
        /Feedback:\s*(.*?)(?=Strengths:|$)/s,
      );
      const feedback = feedbackMatch
        ? feedbackMatch[1].trim()
        : "Good response with room for improvement.";

      const strengthsMatch = evaluation.match(
        /Strengths:\s*(.*?)(?=Improvements:|$)/s,
      );
      const strengthsText = strengthsMatch
        ? strengthsMatch[1]
        : "";
      const strengths = strengthsText
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.replace(/^-\s*/, "").trim())
        .filter((line) => line.length > 0);

      const improvementsMatch = evaluation.match(
        /Improvements:\s*(.*?)$/s,
      );
      const improvementsText = improvementsMatch
        ? improvementsMatch[1]
        : "";
      const improvements = improvementsText
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.replace(/^-\s*/, "").trim())
        .filter((line) => line.length > 0);

      return {
        score,
        feedback,
        strengths:
          strengths.length > 0
            ? strengths
            : ["Provided a response to the question"],
        improvements:
          improvements.length > 0
            ? improvements
            : [
                "Consider providing more specific examples and details",
              ],
      };
    } catch (error) {
      console.error("Error evaluating response:", error);
      // Fallback evaluation
      const responseLength = userResponse.length;
      const hasSpecificExample =
        /when|time|example|situation|project/i.test(
          userResponse,
        );
      const hasActions =
        /did|took|implemented|decided|chose|approach/i.test(
          userResponse,
        );
      const hasOutcome =
        /result|outcome|success|learn|improve/i.test(
          userResponse,
        );

      let baseScore = 40;
      if (responseLength > 100) baseScore += 20;
      if (responseLength > 200) baseScore += 10;
      if (hasSpecificExample) baseScore += 15;
      if (hasActions) baseScore += 10;
      if (hasOutcome) baseScore += 15;

      const score = Math.min(100, baseScore);

      return {
        score,
        feedback:
          score >= 70
            ? "Good response with clear examples and structure."
            : "Your response could benefit from more specific details and examples.",
        strengths: hasSpecificExample
          ? ["Provided specific examples"]
          : ["Responded to the question"],
        improvements:
          score < 70
            ? [
                "Add more specific examples",
                "Provide more detailed explanations",
              ]
            : ["Consider elaborating on outcomes"],
      };
    }
  };

  // Start interview with selected type
  const startInterview = async () => {
    const question = await generateQuestion(selectedType);
    setSession({
      type: selectedType,
      currentQuestion: question,
      questions: [question],
      responses: [],
      overallScore: 0,
      isComplete: false,
      isStarted: true,
    });
    toast.success(
      `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} interview started!`,
    );
  };

  // Submit response for evaluation
  const handleSubmitResponse = async () => {
    if (!currentResponse.trim()) {
      toast.error(
        "Please provide a response before submitting",
      );
      return;
    }

    if (!session.currentQuestion) return;

    setIsSubmitting(true);

    try {
      const feedback = await evaluateResponse(
        session.currentQuestion,
        currentResponse,
      );

      const newResponse = {
        question: session.currentQuestion,
        response: currentResponse,
        feedback,
      };

      const updatedResponses = [
        ...session.responses,
        newResponse,
      ];
      const newOverallScore = Math.round(
        updatedResponses.reduce(
          (sum, r) => sum + r.feedback.score,
          0,
        ) / updatedResponses.length,
      );

      setSession((prev) => ({
        ...prev,
        responses: updatedResponses,
        overallScore: newOverallScore,
      }));

      setShowFeedback(true);
      toast.success(
        `Response evaluated! Score: ${feedback.score}/100`,
      );
    } catch (error) {
      console.error("Error evaluating response:", error);
      toast.error(
        "Failed to evaluate response. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate next question
  const handleNextScenario = async () => {
    if (!session.type) return;

    const nextQuestion = await generateQuestion(session.type);
    setSession((prev) => ({
      ...prev,
      currentQuestion: nextQuestion,
      questions: [...prev.questions, nextQuestion],
    }));
    setCurrentResponse("");
    setShowFeedback(false);
  };

  // Handle quit interview
  const handleQuitInterview = () => {
    // Log failed session (in a real app, this would be sent to backend)
    const sessionData = {
      user_email: currentUser.email,
      interview_type: session.type,
      score: 0,
      status: "failed",
      timestamp: new Date().toISOString(),
    };

    console.log("Logging failed session:", sessionData);
    toast.error("Interview session logged as failed");

    // Reset session
    setSession({
      type: null,
      currentQuestion: null,
      questions: [],
      responses: [],
      overallScore: 0,
      isComplete: false,
      isStarted: false,
    });
    setCurrentResponse("");
    setShowFeedback(false);
    setShowQuitDialog(false);
  };

  // Complete interview
  const completeInterview = () => {
    setSession((prev) => ({ ...prev, isComplete: true }));
    toast.success("Interview completed successfully!");
  };

  // Restart interview
  const restartInterview = () => {
    setSession({
      type: null,
      currentQuestion: null,
      questions: [],
      responses: [],
      overallScore: 0,
      isComplete: false,
      isStarted: false,
    });
    setCurrentResponse("");
    setShowFeedback(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80)
      return "text-green-600 dark:text-green-400";
    if (score >= 60)
      return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (score >= 60)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "behavioral":
        return <Users className="w-4 h-4" />;
      case "situational":
        return <Target className="w-4 h-4" />;
      case "technical":
        return <Code2 className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "behavioral":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "situational":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "technical":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const isActive = session.isStarted && !session.isComplete;

  return (
    <div className="max-w-main mx-auto px-content space-y-8 py-8">
      {!isActive ? (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">AI Interview Simulator</h1>
            <p className="text-muted-foreground text-lg max-w-content mx-auto">
              Practice technical interviews with our advanced AI interviewer powered by Google Gemini
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Select Interview Type
              </CardTitle>
              <CardDescription>
                Choose the type of interview you'd like to practice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-enhanced">
                {interviewTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedType === type.id ? 'border-primary ring-2 ring-primary/20' : ''
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${type.bgColor}`}>
                        <type.icon className={`w-6 h-6 ${type.color}`} />
                      </div>
                      <h3 className="font-semibold mb-2">{type.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                      <Badge variant="outline">{type.duration}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Button
                  onClick={startInterview}
                  disabled={isGeneratingQuestion}
                  className="w-button-enhanced"
                  style={{
                    backgroundColor: "#007BFF",
                    color: "white",
                  }}
                >
                  {isGeneratingQuestion ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Question...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Interview
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Brain className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <span className="font-medium">AI-Powered Evaluation:</span> Get detailed feedback on your responses including
              scores (0-100), strengths identification, and specific improvement suggestions powered by Gemini AI.
            </AlertDescription>
          </Alert>
        </div>
      ) : isActive ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Interview Simulator
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Practice your interview skills with AI-powered
              feedback. Get evaluated on behavioral, situational,
              and technical questions with detailed scoring and
              improvement suggestions.
            </p>
          </div>

          {/* Interview Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">
                  Behavioral
                </CardTitle>
                <CardDescription>
                  Past experiences and situations that demonstrate
                  your skills and personality
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">
                  Situational
                </CardTitle>
                <CardDescription>
                  Hypothetical scenarios to assess your
                  problem-solving and decision-making skills
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Code2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">
                  Technical
                </CardTitle>
                <CardDescription>
                  System design and technical problem-solving
                  questions for engineering roles
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Features */}
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              <span className="font-medium">
                AI-Powered Evaluation:
              </span>{" "}
              Get detailed feedback on your responses including
              scores (0-100), strengths identification, and
              specific improvement suggestions powered by Gemini
              AI.
            </AlertDescription>
          </Alert>

          {/* Start Button */}
          <div className="text-center">
            <Button
              onClick={startInterview}
              disabled={isGeneratingQuestion}
              className="px-12 py-3 text-lg"
              style={{
                backgroundColor: "#007BFF",
                color: "white",
              }}
            >
              {isGeneratingQuestion ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Question...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start{" "}
                  {selectedType.charAt(0).toUpperCase() +
                    selectedType.slice(1)}{" "}
                  Interview
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Completion Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Interview Complete!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Great job completing the {session.type} interview
              simulation. Here's your performance summary:
            </p>
          </div>

          {/* Overall Score */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Overall Score
              </CardTitle>
              <div
                className={`text-6xl font-bold ${getScoreColor(session.overallScore)}`}
              >
                {session.overallScore}/100
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${session.overallScore}%` }}
                />
              </div>
            </CardHeader>
          </Card>

          {/* Response Summary */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Response Summary
            </h2>
            {session.responses.map((response, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(response.question.type)}
                        <Badge
                          className={getTypeColor(
                            response.question.type,
                          )}
                          variant="secondary"
                        >
                          {response.question.type}
                        </Badge>
                      </div>
                      <span className="font-medium">
                        {response.question.category}
                      </span>
                    </div>
                    <Badge
                      className={getScoreBadgeColor(
                        response.feedback.score,
                      )}
                      variant="secondary"
                    >
                      {response.feedback.score}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {response.question.question}
                  </p>

                  {response.feedback.strengths.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                        Strengths:
                      </p>
                      <ul className="text-sm text-green-600 dark:text-green-400 list-disc list-inside">
                        {response.feedback.strengths.map(
                          (strength, i) => (
                            <li key={i}>{strength}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                  {response.feedback.improvements.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">
                        Areas for Improvement:
                      </p>
                      <ul className="text-sm text-orange-600 dark:text-orange-400 list-disc list-inside">
                        {response.feedback.improvements.map(
                          (improvement, i) => (
                            <li key={i}>{improvement}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button onClick={restartInterview} variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Practice Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}