import React, { useEffect } from 'react';
import { Box, Button, Step, StepLabel, Stepper } from '@mui/material';
import { useWizardData } from './WizardDataContext';
import { saveDraft, clearDraft } from '../../utils/draftStorage';
import { useSnackbar } from '../feedback/SnackbarProvider';
import { WizardProvider, useWizard, WizardStep } from './WizardContext';

interface MultiStepWizardProps {
  steps: WizardStep[];
  children: React.ReactNode[] | React.ReactNode;
  onFinish?: () => void;
  validators?: Array<() => Promise<boolean> | boolean | undefined>;
  beforeNext?: (index: number) => void | Promise<void>;
  beforeSubmit?: () => void | Promise<void>;
  initialActiveIndex?: number;
}

const Inner: React.FC<Omit<MultiStepWizardProps, 'steps'> & { providedSteps: WizardStep[] }> = ({ providedSteps, children, onFinish, validators, beforeNext, beforeSubmit }) => {
  const { steps, setSteps, activeIndex, goBack, goNext, isLast } = useWizard();
  const { push } = useSnackbar();
  const { customer, loan, documents } = useWizardData();

  useEffect(() => { setSteps(providedSteps); }, [providedSteps, setSteps]);

  const childArray = React.Children.toArray(children);
  const activeChild = childArray[activeIndex];

  return (
    <Box>
      <Stepper activeStep={activeIndex} alternativeLabel sx={{ mb:4 }}>
        {steps.map(s => (
          <Step key={s.id}>
            <StepLabel>{s.title}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mb:3 }}>{activeChild}</Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', gap:2, flexWrap:'wrap' }}>
        <Box sx={{ display:'flex', gap:1 }}>
          <Button disabled={activeIndex === 0} onClick={goBack} variant="outlined">Back</Button>
          <Button variant="outlined" onClick={() => {
            const ok = saveDraft({ activeIndex, customer, loan, documents });
            if (ok) {
              push('Draft saved. You can return later to resume.', 'success');
            } else {
              push('Unable to save draft (storage unavailable).', 'error');
            }
          }} sx={{
            borderColor:'#011A41',
            color:'#011A41',
            fontWeight:700,
            '&:hover': { borderColor:'#011A41', background:'#011A41', color:'#FFFFFF' }
          }}>Pause & Save</Button>
        </Box>
        {!isLast && (
          <Button onClick={async () => {
            if (validators && validators[activeIndex]) {
              const valid = await Promise.resolve(validators[activeIndex]!());
              if (!valid) return; // validator handles messaging
            }
            if (beforeNext) await beforeNext(activeIndex);
            goNext();
          }} variant="contained">Next</Button>
        )}
        {isLast && (
          <Button color="secondary" variant="contained" onClick={async () => {
            if (beforeSubmit) await beforeSubmit();
            if (validators && validators[activeIndex]) {
              const valid = await Promise.resolve(validators[activeIndex]!());
              if (!valid) return;
            }
            onFinish?.();
            clearDraft();
          }}>Submit</Button>
        )}
      </Box>
    </Box>
  );
};

export const MultiStepWizard: React.FC<MultiStepWizardProps> = ({ steps, children, onFinish, validators, beforeNext, beforeSubmit, initialActiveIndex }) => {
  return (
    <WizardProvider initial={steps} initialActiveIndex={initialActiveIndex}>
      <Inner providedSteps={steps} onFinish={onFinish} validators={validators} beforeNext={beforeNext} beforeSubmit={beforeSubmit}>{children}</Inner>
    </WizardProvider>
  );
};
