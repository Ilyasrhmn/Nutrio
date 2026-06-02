import { cn } from "@workspace/ui/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: { id: string; label: string }[];
}

export function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full px-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={step.id} className="flex flex-col items-center flex-1 relative">
            {/* Line connecting steps */}
            {index < totalSteps - 1 && (
              <div 
                className={cn(
                  "absolute h-[2px] w-full top-5 left-1/2 -z-10",
                  isCompleted ? "bg-green-600" : "bg-slate-200"
                )}
              />
            )}
            
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                isCompleted ? "bg-green-600 border-green-600 text-white" : 
                isActive ? "bg-white border-green-600 text-green-600 shadow-sm" : 
                "bg-white border-slate-200 text-slate-400"
              )}
            >
              {isCompleted ? <Check className="h-5 w-5" /> : <span className="text-sm font-bold">{index + 1}</span>}
            </div>
            <span className={cn(
              "text-[10px] mt-2 font-medium transition-colors",
              isActive ? "text-green-700 font-bold" : "text-slate-500"
            )}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
