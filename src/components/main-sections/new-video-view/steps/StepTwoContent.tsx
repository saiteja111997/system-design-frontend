import { ScriptEditor } from "../ScriptEditor";

interface StepTwoContentProps {
  onNext: () => void;
}

export function StepTwoContent({ onNext }: StepTwoContentProps) {
  return <ScriptEditor onNext={onNext} />;
}
