import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { ONBOARDING_STEPS } from "../../constants";
import { saveOnboardingDone } from "../../store/storage";

export const Onboarding = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const currentStep = ONBOARDING_STEPS[step];
  const isLastStep = step === ONBOARDING_STEPS.length - 1;
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (isLastStep) {
      saveOnboardingDone();
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    saveOnboardingDone();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}>
      <div className="card rounded-2xl w-full max-w-md overflow-hidden animate-scaleIn">
        {/* Progress */}
        <div className="flex gap-1.5 p-4 pb-0">
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: i <= step ? 'var(--accent-blue)' : 'var(--bg-input)' }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center animate-bounce-subtle" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight mb-3" style={{ color: 'var(--text-heading)' }}>{currentStep.title}</h2>
          <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{currentStep.description}</p>
        </div>

        {/* Actions */}
        <div className="p-4 pt-0 flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 transition-colors" style={{ color: 'var(--text-muted)' }}
          >
            Passer
          </button>
          <button
            onClick={handleNext}
            className="btn-primary flex-1 py-3 rounded-lg font-medium justify-center btn-ripple"
          >
            {isLastStep ? "C'est parti !" : "Suivant"}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
