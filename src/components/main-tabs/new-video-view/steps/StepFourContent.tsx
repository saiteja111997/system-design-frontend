import { VideoTimeline } from "../VideoTimeline";

interface StepFourContentProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepFourContent({ onNext, onBack }: StepFourContentProps) {
  return <VideoTimeline onNext={onNext} onBack={onBack} />;
}
