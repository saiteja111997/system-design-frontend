import { useState } from "react";
import NextImage from "next/image";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Scissors,
  Copy,
  Trash2,
  Plus,
  Image as ImageIcon,
  Music,
  Type,
  Layers,
  Wand2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface VideoTimelineProps {
  onNext: () => void;
  onBack: () => void;
}

const timelineClips = [
  { id: 1, type: "video", start: 0, duration: 45, label: "Intro Hook" },
  { id: 2, type: "video", start: 45, duration: 120, label: "Main Content" },
  { id: 3, type: "video", start: 165, duration: 30, label: "Call to Action" },
];

const audioTracks = [
  { id: 1, type: "voice", start: 0, duration: 195, label: "AI Voiceover" },
  { id: 2, type: "music", start: 0, duration: 195, label: "Background Music" },
];

export function VideoTimeline({ onNext, onBack }: VideoTimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([80]);
  const totalDuration = 195;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-full"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Timeline Editor
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Wand2 className="w-3 h-3" />
            AI Enhanced
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-9 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                <NextImage
                  src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Preview"
                  width={800}
                  height={450}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 bg-white/90 hover:bg-white"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-slate-900" />
                    ) : (
                      <Play className="w-8 h-8 text-slate-900 ml-1" />
                    )}
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/80 text-white text-sm px-3 py-1 rounded">
                  {Math.floor(currentTime / 60)}:
                  {(currentTime % 60).toString().padStart(2, "0")} /{" "}
                  {Math.floor(totalDuration / 60)}:
                  {(totalDuration % 60).toString().padStart(2, "0")}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button size="icon" variant="outline">
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button size="icon" variant="outline">
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  <div className="flex-1">
                    <Slider
                      value={[currentTime]}
                      max={totalDuration}
                      step={1}
                      onValueChange={(value) => setCurrentTime(value[0])}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-32">
                    <Volume2 className="w-4 h-4 text-slate-500" />
                    <Slider
                      value={volume}
                      max={100}
                      step={1}
                      onValueChange={setVolume}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Video Track
                    </span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <Scissors className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="relative h-16 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                    {timelineClips.map((clip) => (
                      <motion.div
                        key={clip.id}
                        className="absolute h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded flex items-center px-3 cursor-pointer hover:from-blue-600 hover:to-cyan-600 transition-all"
                        style={{
                          left: `${(clip.start / totalDuration) * 100}%`,
                          width: `${(clip.duration / totalDuration) * 100}%`,
                        }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-xs font-medium text-white truncate">
                          {clip.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Audio Tracks
                    </span>
                  </div>

                  {audioTracks.map((track) => (
                    <div
                      key={track.id}
                      className="relative h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden"
                    >
                      <motion.div
                        className="absolute h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded flex items-center px-3 cursor-pointer hover:from-green-600 hover:to-emerald-600 transition-all"
                        style={{
                          left: `${(track.start / totalDuration) * 100}%`,
                          width: `${(track.duration / totalDuration) * 100}%`,
                        }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-xs font-medium text-white truncate">
                          {track.label}
                        </span>
                      </motion.div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Text & Subtitles
                    </span>
                  </div>
                  <div className="relative h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                    <Button size="sm" variant="ghost" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Subtitles
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">Save Draft</Button>
              <Button
                onClick={onNext}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                Review & Publish
              </Button>
            </div>
          </div>
        </div>

        <div className="col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Editing Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="effects" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="effects" className="text-xs">
                    <Layers className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="media" className="text-xs">
                    <ImageIcon className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="text-xs">
                    <Music className="w-3 h-3" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="effects" className="space-y-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    Transitions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    Animations
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <Type className="w-4 h-4" />
                    Text Effects
                  </Button>
                </TabsContent>

                <TabsContent value="media" className="space-y-2 mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="aspect-video bg-slate-200 dark:bg-slate-700 rounded cursor-pointer hover:ring-2 ring-blue-500 transition-all"
                      >
                        <NextImage
                          src={`https://images.pexels.com/photos/${
                            8386440 + i
                          }/pexels-photo-${
                            8386440 + i
                          }.jpeg?auto=compress&cs=tinysrgb&w=200`}
                          alt={`Media ${i}`}
                          width={200}
                          height={112}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Add Media
                  </Button>
                </TabsContent>

                <TabsContent value="audio" className="space-y-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <Music className="w-4 h-4" />
                    Background Music
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <Music className="w-4 h-4" />
                    Sound Effects
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    AI Music
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-sm">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>• Use transitions between clips for smooth flow</p>
              <p>• Keep background music 20-30% volume</p>
              <p>• Add captions for better engagement</p>
              <p>• Use jump cuts to remove dead air</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
