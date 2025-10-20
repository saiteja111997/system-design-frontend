import { motion } from "framer-motion";
import { Check, Download, Share2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StepFiveContentProps {
  onBack: () => void;
}

export function StepFiveContent({ onBack }: StepFiveContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Review & Publish
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Your video is ready! Review and publish when you&apos;re happy with
          the result
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Video Preview</CardTitle>
            <CardDescription>Preview your generated video</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center mb-4">
              <Button
                size="lg"
                className="bg-gradient-primary hover:bg-gradient-primary-hover text-white"
              >
                <Play className="w-6 h-6 mr-2" />
                Play Preview
              </Button>
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>
                <strong>Duration:</strong> 2:34
              </p>
              <p>
                <strong>Resolution:</strong> 1920x1080
              </p>
              <p>
                <strong>Format:</strong> MP4
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing Options</CardTitle>
            <CardDescription>
              Choose how to export and share your video
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-gradient-primary hover:bg-gradient-primary-hover text-white">
              <Download className="w-4 h-4 mr-2" />
              Download Video
            </Button>

            <Button variant="outline" className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Quick Export Options</h4>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  Export for YouTube
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  Export for Instagram
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  Export for TikTok
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          Back to Timeline
        </Button>
        <Button className="bg-gradient-primary hover:bg-gradient-primary-hover text-white">
          <Check className="w-4 h-4 mr-2" />
          Publish Video
        </Button>
      </div>
    </motion.div>
  );
}
