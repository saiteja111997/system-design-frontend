import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileText, Mic, Image, Check } from "lucide-react";
import { StepOneContent } from "./steps/StepOneContent";
import { StepTwoContent } from "./steps/StepTwoContent";
import { StepThreeContent } from "./steps/StepThreeContent";
import { StepFourContent } from "./steps/StepFourContent";
import { StepFiveContent } from "./steps/StepFiveContent";

const steps = [
  { id: 1, title: "Choose Method", icon: Sparkles },
  { id: 2, title: "Script & Content", icon: FileText },
  { id: 3, title: "Voice & Avatar", icon: Mic },
  { id: 4, title: "Edit Timeline", icon: Image },
  { id: 5, title: "Review & Publish", icon: Check },
];

export function NewVideoView() {
  const [currentStep, setCurrentStep] = useState(1);
  const [creationMethod, setCreationMethod] = useState<"ai" | "upload" | null>(
    null
  );
  const [selections, setSelections] = useState({
    selectedVoice: "",
    selectedAvatar: "",
  });

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <StepOneContent
          creationMethod={creationMethod}
          setCreationMethod={setCreationMethod}
          onNext={() => setCurrentStep(2)}
        />
      );
    }

    if (currentStep === 2) {
      return <StepTwoContent onNext={() => setCurrentStep(3)} />;
    }

    if (currentStep === 3) {
      return (
        <StepThreeContent
          selections={selections}
          setSelections={setSelections}
          onNext={() => setCurrentStep(4)}
          onBack={() => setCurrentStep(2)}
        />
      );
    }

    if (currentStep === 4) {
      return (
        <StepFourContent
          onNext={() => setCurrentStep(5)}
          onBack={() => setCurrentStep(3)}
        />
      );
    }

    if (currentStep === 5) {
      return <StepFiveContent onBack={() => setCurrentStep(4)} />;
    }

    return null;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep >= step.id
                      ? "bg-gradient-primary text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                  }`}
                  animate={{
                    scale: currentStep === step.id ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <step.icon className="w-6 h-6" />
                </motion.div>
                <span className="text-xs mt-2 text-slate-600 dark:text-slate-400 font-medium">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 mb-6 ${
                    currentStep > step.id
                      ? "bg-gradient-primary"
                      : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
    </div>
  );
}
