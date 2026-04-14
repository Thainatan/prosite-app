'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { getTutorial, TUTORIALS } from '../../lib/tutorials';
import TutorialEngine from './TutorialEngine';

interface TutorialContextType {
  activeTutorialId: string | null;
  currentStep: number;
  isDisabled: boolean;
  startTutorial: (id: string, fromStep?: number) => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setDisabled: (v: boolean) => void;
  getTutorialStatus: (id: string) => 'completed' | 'skipped' | 'not_started';
  resetTutorial: (id: string) => void;
  resetAll: () => void;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial must be used inside TutorialProvider');
  return ctx;
}

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [activeTutorialId, setActiveTutorialId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDisabled, setIsDisabledState] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('tutorials_disabled') === '1';
  });

  const startTutorial = useCallback((id: string, fromStep = 0) => {
    const tutorial = getTutorial(id);
    if (!tutorial) return;
    if (isDisabled) return;
    setActiveTutorialId(id);
    setCurrentStep(fromStep);
    // Save current step
    if (typeof window !== 'undefined') {
      localStorage.setItem(`tutorial_current_step_${id}`, String(fromStep));
    }
  }, [isDisabled]);

  const skipTutorial = useCallback(() => {
    if (!activeTutorialId) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`tutorial_skipped_${activeTutorialId}`, '1');
      localStorage.removeItem(`tutorial_current_step_${activeTutorialId}`);
    }
    setActiveTutorialId(null);
    setCurrentStep(0);
  }, [activeTutorialId]);

  const completeTutorial = useCallback(() => {
    if (!activeTutorialId) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`tutorial_completed_${activeTutorialId}`, '1');
      localStorage.removeItem(`tutorial_current_step_${activeTutorialId}`);
    }
    setActiveTutorialId(null);
    setCurrentStep(0);
  }, [activeTutorialId]);

  const nextStep = useCallback(() => {
    if (!activeTutorialId) return;
    const tutorial = getTutorial(activeTutorialId);
    if (!tutorial) return;
    const next = currentStep + 1;
    if (next >= tutorial.steps.length) {
      completeTutorial();
    } else {
      setCurrentStep(next);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`tutorial_current_step_${activeTutorialId}`, String(next));
      }
    }
  }, [activeTutorialId, currentStep, completeTutorial]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      if (activeTutorialId && typeof window !== 'undefined') {
        localStorage.setItem(`tutorial_current_step_${activeTutorialId}`, String(prev));
      }
    }
  }, [currentStep, activeTutorialId]);

  const setDisabled = useCallback((v: boolean) => {
    setIsDisabledState(v);
    if (typeof window !== 'undefined') {
      if (v) localStorage.setItem('tutorials_disabled', '1');
      else localStorage.removeItem('tutorials_disabled');
    }
    if (v && activeTutorialId) {
      setActiveTutorialId(null);
      setCurrentStep(0);
    }
  }, [activeTutorialId]);

  const getTutorialStatus = useCallback((id: string): 'completed' | 'skipped' | 'not_started' => {
    if (typeof window === 'undefined') return 'not_started';
    if (localStorage.getItem(`tutorial_completed_${id}`) === '1') return 'completed';
    if (localStorage.getItem(`tutorial_skipped_${id}`) === '1') return 'skipped';
    return 'not_started';
  }, []);

  const resetTutorial = useCallback((id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`tutorial_completed_${id}`);
      localStorage.removeItem(`tutorial_skipped_${id}`);
      localStorage.removeItem(`tutorial_current_step_${id}`);
    }
  }, []);

  const resetAll = useCallback(() => {
    if (typeof window !== 'undefined') {
      TUTORIALS.forEach(t => {
        localStorage.removeItem(`tutorial_completed_${t.id}`);
        localStorage.removeItem(`tutorial_skipped_${t.id}`);
        localStorage.removeItem(`tutorial_current_step_${t.id}`);
      });
    }
  }, []);

  return (
    <TutorialContext.Provider value={{
      activeTutorialId, currentStep, isDisabled,
      startTutorial, skipTutorial, completeTutorial,
      nextStep, prevStep, setDisabled,
      getTutorialStatus, resetTutorial, resetAll,
    }}>
      {children}
      <TutorialEngine />
    </TutorialContext.Provider>
  );
}
