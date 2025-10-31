// ui/src/components/onboarding/OnboardingFlow.tsx - Main container for LGPD onboarding flow

import { useState, useEffect } from "react";
import { OnboardingWelcome } from "./OnboardingWelcome";
import { OnboardingConsent } from "./OnboardingConsent";
import { OnboardingPermissions } from "./OnboardingPermissions";
import { OnboardingComplete } from "./OnboardingComplete";
import {
  loadOnboardingProgress,
  initializeOnboardingProgress,
  updateOnboardingStep,
  isOnboardingComplete,
  clearOnboardingProgress,
} from "../../shared/lib/ConsentHelper";
import { getAuthInfo } from "../../LoginHelper";
import type { BrandingConfig } from "../../shared/lib/BrandingHelper";
import type { OnboardingProgress } from "../../shared/lib/ConsentHelper";

interface OnboardingFlowProps {
  onComplete: () => void;
  config?: BrandingConfig | null;
}

export function OnboardingFlow({ onComplete, config }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);

  useEffect(() => {
    // Load existing progress or initialize new one
    let existingProgress = loadOnboardingProgress();

    if (!existingProgress) {
      existingProgress = initializeOnboardingProgress();
    }

    setProgress(existingProgress);
    setCurrentStep(existingProgress.currentStep);

    // If onboarding is already complete, go directly to completion
    if (isOnboardingComplete()) {
      setCurrentStep(4);
    }
  }, []);

  const handleNext = () => {
    const nextStep = currentStep + 1;

    // Mark current step as completed
    updateOnboardingStep(currentStep, true);
    updateOnboardingStep(nextStep, false);

    setCurrentStep(nextStep);

    // Update progress state
    const updatedProgress = loadOnboardingProgress();
    setProgress(updatedProgress);
  };

  const handleBack = () => {
    const prevStep = currentStep - 1;

    if (prevStep >= 1) {
      updateOnboardingStep(prevStep, false);
      setCurrentStep(prevStep);

      // Update progress state
      const updatedProgress = loadOnboardingProgress();
      setProgress(updatedProgress);
    }
  };

  const handleSkip = () => {
    // For now, skip goes to the next step
    // In a real implementation, this might set a flag or handle differently
    handleNext();
  };

  const handleComplete = () => {
    // Mark onboarding as fully complete
    updateOnboardingStep(4, true);

    // Call the completion callback
    onComplete();
  };

  const handleRestart = () => {
    // Clear all progress and start over
    clearOnboardingProgress();
    setCurrentStep(1);
    setProgress(initializeOnboardingProgress());
  };

  // Get user info for consent tracking
  const authInfo = getAuthInfo();

  // Loading state while progress is being initialized
  if (!progress) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="text-muted">Iniciando configuração...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate step
  switch (currentStep) {
    case 1:
      return (
        <OnboardingWelcome
          onNext={handleNext}
          onSkip={handleSkip}
          config={config}
        />
      );

    case 2:
      return (
        <OnboardingConsent
          onNext={handleNext}
          onBack={handleBack}
          config={config}
          userEmail={authInfo?.email}
        />
      );

    case 3:
      return (
        <OnboardingPermissions
          onNext={handleNext}
          onBack={handleBack}
          config={config}
        />
      );

    case 4:
      return <OnboardingComplete onFinish={handleComplete} config={config} />;

    default:
      // Fallback - should not happen, but restart if it does
      console.warn("Invalid onboarding step:", currentStep);
      handleRestart();
      return (
        <OnboardingWelcome
          onNext={handleNext}
          onSkip={handleSkip}
          config={config}
        />
      );
  }
}

export default OnboardingFlow;
