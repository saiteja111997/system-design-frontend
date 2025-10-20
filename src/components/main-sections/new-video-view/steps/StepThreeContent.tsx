import { motion } from "framer-motion";
import { Mic, User, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StepThreeContentProps {
  selections: {
    selectedVoice: string;
    selectedAvatar: string;
  };
  setSelections: (selections: {
    selectedVoice: string;
    selectedAvatar: string;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

const voices = [
  "Professional Male",
  "Professional Female",
  "Casual Male",
  "Casual Female",
  "British Accent",
  "Clone My Voice",
];
const avatars = [
  "Faceless",
  "Avatar 1",
  "Avatar 2",
  "Avatar 3",
  "Avatar 4",
  "Avatar 5",
];

export function StepThreeContent({
  selections,
  setSelections,
  onNext,
  onBack,
}: StepThreeContentProps) {
  const handleVoiceSelect = (voice: string) => {
    setSelections({
      ...selections,
      selectedVoice: voice,
    });
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelections({
      ...selections,
      selectedAvatar: avatar,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Choose Voice & Avatar
      </h2>

      <Tabs defaultValue="voice" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="voice">Voice Settings</TabsTrigger>
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Voice</CardTitle>
              <CardDescription>
                Choose a voice for your video narration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {voices.map((voice) => (
                  <Card
                    key={voice}
                    className={`cursor-pointer transition-all border-2 ${
                      selections.selectedVoice === voice
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-blue-500"
                    }`}
                    onClick={() => handleVoiceSelect(voice)}
                  >
                    <CardContent className="p-4 text-center">
                      <Mic
                        className={`w-8 h-8 mx-auto mb-2 ${
                          selections.selectedVoice === voice
                            ? "text-blue-600"
                            : "text-blue-500"
                        }`}
                      />
                      <p className="font-medium">{voice}</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Preview
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avatar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Avatar</CardTitle>
              <CardDescription>
                Choose an AI avatar or go faceless
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                {avatars.map((avatar, idx) => (
                  <Card
                    key={avatar}
                    className={`cursor-pointer transition-all border-2 ${
                      selections.selectedAvatar === avatar
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-blue-500"
                    }`}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    <CardContent className="p-4 text-center">
                      <div
                        className={`w-full aspect-square rounded-lg flex items-center justify-center mb-2 ${
                          selections.selectedAvatar === avatar
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800"
                        }`}
                      >
                        {idx === 0 ? (
                          <Wand2
                            className={`w-12 h-12 ${
                              selections.selectedAvatar === avatar
                                ? "text-blue-600"
                                : "text-slate-500"
                            }`}
                          />
                        ) : (
                          <User
                            className={`w-12 h-12 ${
                              selections.selectedAvatar === avatar
                                ? "text-blue-600"
                                : "text-slate-500"
                            }`}
                          />
                        )}
                      </div>
                      <p className="font-medium text-sm">{avatar}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          className="bg-gradient-primary hover:bg-gradient-primary-hover text-white transition-all duration-200"
          onClick={onNext}
        >
          Continue to Timeline
        </Button>
      </div>
    </motion.div>
  );
}
