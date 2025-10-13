import { motion } from "framer-motion";
import { Sparkles, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StepOneContentProps {
  creationMethod: "ai" | "upload" | null;
  setCreationMethod: (method: "ai" | "upload") => void;
  onNext: () => void;
}

export function StepOneContent({
  creationMethod,
  setCreationMethod,
  onNext,
}: StepOneContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          How would you like to create?
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Choose your preferred method to start creating amazing content
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card
          className={`cursor-pointer transition-all hover:shadow-xl border-2 ${
            creationMethod === "ai"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              : "border-slate-200 dark:border-slate-800"
          }`}
          onClick={() => setCreationMethod("ai")}
        >
          <CardHeader>
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">AI-Generated Video</CardTitle>
            <CardDescription className="text-base">
              Let AI create your video from scratch using scripts, avatars, and
              voiceovers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                AI script generation
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Realistic avatars & voiceovers
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Auto B-roll & effects
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Perfect for faceless channels
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-xl border-2 ${
            creationMethod === "upload"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              : "border-slate-200 dark:border-slate-800"
          }`}
          onClick={() => setCreationMethod("upload")}
        >
          <CardHeader>
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Upload & Enhance</CardTitle>
            <CardDescription className="text-base">
              Upload your footage and let AI enhance it with professional
              editing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Auto quality enhancement
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Smart clip extraction
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Remove dead air & pauses
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Generate Shorts instantly
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          className="bg-gradient-primary hover:bg-gradient-primary-hover text-white transition-all duration-200"
          disabled={!creationMethod}
          onClick={onNext}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
