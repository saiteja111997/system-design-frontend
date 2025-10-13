import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Copy, Download, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ScriptEditorProps {
  onNext: () => void;
}

const trendingTopics = [
  { title: "AI Tools for Productivity", score: 95 },
  { title: "Side Hustles in 2024", score: 92 },
  { title: "iPhone 15 Review", score: 88 },
  { title: "Passive Income Ideas", score: 85 },
];

const suggestedHooks = [
  "What if I told you there's a way to...",
  "Stop wasting time on... Here's what works:",
  "I made $10K in 30 days doing this...",
  "The secret nobody talks about is...",
];

export function ScriptEditor({ onNext }: ScriptEditorProps) {
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setScript(`[HOOK]
What if I told you there's an AI tool that can create entire YouTube videos in minutes?

[INTRODUCTION]
Hey everyone, welcome back to the channel! Today, I'm sharing something that's going to revolutionize how you create content on YouTube.

[MAIN CONTENT]
This AI-powered platform combines everything you need - from script generation to video editing, thumbnails, and even SEO optimization. Let me show you exactly how it works...

[First Benefit]
The AI assistant analyzes trending topics in your niche and suggests video ideas that are proven to get views. It's like having a research team working 24/7.

[Second Benefit]
You can either generate videos from scratch using AI avatars and voiceovers, or upload your own footage and let the AI enhance it automatically.

[Third Benefit]
The platform also creates professional thumbnails and optimizes your titles for maximum click-through rates using A/B testing.

[CALL TO ACTION]
If you found this helpful, make sure to like and subscribe for more content creation tips. Drop a comment if you want me to do a full tutorial!

[OUTRO]
Thanks for watching, and I'll see you in the next video!`);
      setGenerating(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Script & Content Research
      </h2>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Script Generator</CardTitle>
              <CardDescription>
                Enter your topic and let AI create a compelling script
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Video Topic</label>
                <Input
                  placeholder="e.g., 10 AI Tools That Will Change Your Life"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="text-base"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={!topic || generating}
                  className="bg-gradient-primary hover:bg-gradient-primary-hover gap-2 text-white"
                >
                  <Sparkles className="w-4 h-4" />
                  {generating ? "Generating..." : "Generate Script"}
                </Button>
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analyze Trends
                </Button>
              </div>

              {script && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Generated Script
                    </label>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                  />
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>
                      {script.split(" ").length} words • ~
                      {Math.ceil(script.split(" ").length / 150)} min read time
                    </span>
                    <Badge variant="secondary" className="gap-1">
                      <Wand2 className="w-3 h-3" />
                      AI Enhanced
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {script && (
            <div className="flex justify-between">
              <Button variant="outline">Save Draft</Button>
              <Button
                onClick={onNext}
                className="bg-gradient-primary hover:bg-gradient-primary-hover text-white transition-all duration-200"
              >
                Continue to Voice & Avatar
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trending Topics</CardTitle>
              <CardDescription>Popular in your niche</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingTopics.map((topic, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setTopic(topic.title)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{topic.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {topic.score}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <TrendingUp className="w-3 h-3" />
                    High engagement potential
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hook Suggestions</CardTitle>
              <CardDescription>
                Grab attention in first 5 seconds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedHooks.map((hook, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {hook}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg">AI Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Videos with strong hooks in the first 5 seconds retain 60% more
                viewers. Try starting with a question or bold statement!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
