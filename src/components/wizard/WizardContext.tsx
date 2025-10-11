import React, { createContext, useContext, useState, useCallback } from 'react';

export interface WizardStep {
  id: string;
  title: string;
  optional?: boolean;
}

interface WizardContextValue {
  steps: WizardStep[];
  activeIndex: number;
  goNext: () => void;
  goBack: () => void;
  goTo: (index: number) => void;
  setSteps: (steps: WizardStep[]) => void;
  isLast: boolean;
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

export const useWizard = () => {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within WizardProvider');
  return ctx;
};

export const WizardProvider: React.FC<{ initial?: WizardStep[]; initialActiveIndex?: number; children: React.ReactNode; }> = ({ initial = [], initialActiveIndex = 0, children }) => {
  const [steps, setSteps] = useState<WizardStep[]>(initial);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, Math.min(initialActiveIndex, initial.length - 1)));

  const goNext = useCallback(() => setActiveIndex(i => Math.min(i + 1, steps.length - 1)), [steps.length]);
  const goBack = useCallback(() => setActiveIndex(i => Math.max(i - 1, 0)), []);
  const goTo = useCallback((index: number) => setActiveIndex(Math.max(0, Math.min(index, steps.length - 1))), [steps.length]);

  return (
    <WizardContext.Provider value={{ steps, activeIndex, goNext, goBack, goTo, setSteps, isLast: activeIndex === steps.length - 1 }}>
      {children}
    </WizardContext.Provider>
  );
};