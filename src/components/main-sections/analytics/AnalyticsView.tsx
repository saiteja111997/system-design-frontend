import { motion } from "framer-motion";
import Image from "next/image";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  ThumbsUp,
  Clock,
  Users,
  Target,
  Award,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const performanceData = [
  {
    metric: "Views",
    value: "1.2M",
    change: "+12.5%",
    trend: "up",
    icon: Eye,
    color: "blue",
    progress: 85,
  },
  {
    metric: "Watch Time",
    value: "2.4K hrs",
    change: "+18.2%",
    trend: "up",
    icon: Clock,
    color: "green",
    progress: 72,
  },
  {
    metric: "Engagement",
    value: "8.4%",
    change: "-2.1%",
    trend: "down",
    icon: ThumbsUp,
    color: "orange",
    progress: 64,
  },
  {
    metric: "Subscribers",
    value: "45.2K",
    change: "+5.8%",
    trend: "up",
    icon: Users,
    color: "pink",
    progress: 78,
  },
];

const topVideos = [
  {
    title: "10 AI Tools That Will Change Your Life",
    views: "450K",
    ctr: "12.4%",
    avgView: "8:34",
    thumbnail:
      "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    title: "How I Built a $10K/Month SaaS",
    views: "320K",
    ctr: "10.8%",
    avgView: "12:15",
    thumbnail:
      "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    title: "Ultimate Guide to YouTube Growth",
    views: "280K",
    ctr: "9.2%",
    avgView: "15:48",
    thumbnail:
      "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
];

const audienceInsights = [
  { label: "Age 18-24", value: 35, color: "blue" },
  { label: "Age 25-34", value: 45, color: "cyan" },
  { label: "Age 35-44", value: 15, color: "green" },
  { label: "Age 45+", value: 5, color: "slate" },
];

const predictions = [
  {
    title: "Next Video Prediction",
    metric: "Expected Views",
    value: "425K - 550K",
    confidence: "High",
    icon: Target,
  },
  {
    title: "Optimal Post Time",
    metric: "Best Time",
    value: "2:00 PM EST",
    confidence: "High",
    icon: Calendar,
  },
  {
    title: "Growth Forecast",
    metric: "Next Month",
    value: "+8.5K Subscribers",
    confidence: "Medium",
    icon: TrendingUp,
  },
];

export function AnalyticsView() {
  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track your performance and get AI-powered insights
          </p>
        </div>
        <Badge variant="secondary" className="gap-2 px-4 py-2">
          <Award className="w-4 h-4" />
          Last 30 Days
        </Badge>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceData.map((item, idx) => (
          <motion.div
            key={item.metric}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${item.color}-500/20 to-${item.color}-600/20 flex items-center justify-center`}
                  >
                    <item.icon className={`w-6 h-6 text-${item.color}-500`} />
                  </div>
                  <Badge
                    variant={item.trend === "up" ? "default" : "secondary"}
                    className={`gap-1 ${
                      item.trend === "up" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {item.trend === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {item.change}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {item.metric}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {item.value}
                </p>
                <Progress value={item.progress} className="h-1.5" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Top Performing Videos</CardTitle>
              <CardDescription>
                Your best content from last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVideos.map((video, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        width={128}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate mb-2">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {video.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          CTR: {video.ctr}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Avg: {video.avgView}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 mt-6">
            <CardHeader>
              <CardTitle>Audience Demographics</CardTitle>
              <CardDescription>
                Who&apos;s watching your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {audienceInsights.map((insight, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {insight.label}
                      </span>
                      <span className="text-slate-500">{insight.value}%</span>
                    </div>
                    <Progress value={insight.value} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Your primary audience is 25-34 year olds interested in tech
                  and entrepreneurship. Consider creating content that appeals
                  to this demographic.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                AI Predictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictions.map((prediction, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <prediction.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-1">
                        {prediction.title}
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white mb-1">
                        {prediction.value}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {prediction.confidence} Confidence
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Avg CTR
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  11.2%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Retention
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  62%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Shares
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  8.4K
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Comments
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  12.8K
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Growth Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                You&apos;re performing 24% better than similar channels in your
                niche!
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li>• Upload frequency: Optimal</li>
                <li>• Content variety: Good</li>
                <li>• Engagement rate: Excellent</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
