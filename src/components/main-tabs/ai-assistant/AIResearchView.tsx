import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  TrendingUp,
  Sparkles,
  Target,
  Award,
  Eye,
  ThumbsUp,
  Filter,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const trendingTopics = [
  {
    title: "AI Productivity Tools 2024",
    score: 95,
    trend: "up",
    views: "2.4M",
    engagement: "12.8%",
    competition: "Medium",
    keywords: ["AI", "Productivity", "Tools", "Automation"],
  },
  {
    title: "Side Hustle Ideas",
    score: 92,
    trend: "up",
    views: "3.1M",
    engagement: "10.5%",
    competition: "High",
    keywords: ["Side Hustle", "Make Money", "Passive Income"],
  },
  {
    title: "iPhone 15 Pro Review",
    score: 88,
    trend: "stable",
    views: "5.2M",
    engagement: "8.2%",
    competition: "Very High",
    keywords: ["iPhone", "Apple", "Review", "Tech"],
  },
  {
    title: "Beginner Guide to Investing",
    score: 85,
    trend: "up",
    views: "1.8M",
    engagement: "14.2%",
    competition: "Low",
    keywords: ["Investing", "Finance", "Stocks", "Beginner"],
  },
];

const videoIdeas = [
  {
    title: "10 AI Tools That Will 10x Your Productivity",
    hook: "What if you could automate 80% of your work?",
    estimatedViews: "450K - 650K",
    difficulty: "Easy",
    confidence: "High",
  },
  {
    title: "I Built a $10K/Month Business Using Only AI",
    hook: "This AI tool made me quit my job...",
    estimatedViews: "320K - 480K",
    difficulty: "Medium",
    confidence: "High",
  },
  {
    title: "AI vs Human: Who Wins at Content Creation?",
    hook: "The results will shock you...",
    estimatedViews: "280K - 420K",
    difficulty: "Medium",
    confidence: "Medium",
  },
];

const competitors = [
  {
    name: "TechChannel Pro",
    subscribers: "2.4M",
    avgViews: "450K",
    uploadFreq: "3x/week",
    topContent: "AI Tutorials",
  },
  {
    name: "Digital Nomad",
    subscribers: "1.8M",
    avgViews: "320K",
    uploadFreq: "2x/week",
    topContent: "Productivity",
  },
  {
    name: "Side Hustle Hero",
    subscribers: "1.2M",
    avgViews: "280K",
    uploadFreq: "4x/week",
    topContent: "Make Money Online",
  },
];

export function AIResearchView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 2000);
  };

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          AI Research Assistant
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Discover trending topics, analyze competitors, and get AI-powered
          video ideas
        </p>
      </motion.div>

      <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search for topics, keywords, or competitors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-800"
              />
              <Select defaultValue="tech">
                <SelectTrigger className="w-40 bg-white dark:bg-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Tech & AI</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 gap-2"
            >
              {analyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="trending" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="trending">Trending Topics</TabsTrigger>
          <TabsTrigger value="ideas">Video Ideas</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Trending in Your Niche
            </h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          <div className="grid gap-4">
            {trendingTopics.map((topic, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {topic.title}
                          </h3>
                          <Badge
                            variant="default"
                            className="bg-gradient-to-r from-blue-500 to-cyan-500"
                          >
                            Score: {topic.score}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {topic.keywords.map((keyword) => (
                            <Badge
                              key={keyword}
                              variant="secondary"
                              className="text-xs"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <Eye className="w-4 h-4" />
                          <span>Est. Views</span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {topic.views}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>Engagement</span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {topic.engagement}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <Target className="w-4 h-4" />
                          <span>Competition</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            topic.competition === "Low"
                              ? "bg-green-500 text-white"
                              : topic.competition === "Medium"
                              ? "bg-orange-500 text-white"
                              : "bg-red-500 text-white"
                          }
                        >
                          {topic.competition}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <Button size="sm" className="gap-2">
                        <Sparkles className="w-4 h-4" />
                        Generate Video Idea
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ideas" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              AI-Generated Video Ideas
            </h2>
            <Button className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500">
              <RefreshCw className="w-4 h-4" />
              Generate More
            </Button>
          </div>

          <div className="grid gap-4">
            {videoIdeas.map((idea, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                          {idea.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-3">
                          Hook: &quot;{idea.hook}&quot;
                        </p>
                      </div>
                      <Award className="w-6 h-6 text-yellow-500" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Est. Views
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {idea.estimatedViews}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Difficulty
                        </p>
                        <Badge variant="secondary">{idea.difficulty}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Confidence
                        </p>
                        <Badge
                          className={
                            idea.confidence === "High"
                              ? "bg-green-500"
                              : "bg-orange-500"
                          }
                        >
                          {idea.confidence}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 gap-2">
                        <Sparkles className="w-4 h-4" />
                        Use This Idea
                      </Button>
                      <Button size="sm" variant="outline">
                        Save for Later
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Competitor Analysis
            </h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Track Competitor
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitors.map((competitor, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">{competitor.name}</CardTitle>
                    <CardDescription>{competitor.topContent}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Subscribers
                      </span>
                      <span className="font-bold">
                        {competitor.subscribers}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Avg Views
                      </span>
                      <span className="font-bold">{competitor.avgViews}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Upload Freq
                      </span>
                      <span className="font-bold">{competitor.uploadFreq}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Keyword Research</CardTitle>
              <CardDescription>Coming soon...</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
