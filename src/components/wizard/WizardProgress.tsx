import React from 'react';
import { Box, LinearProgress, Typography, Stack } from '@mui/material';

export interface WizardProgressProps {
  current: number; // 0-based index
  total: number;   // total steps >= 1
  labels?: string[]; // optional per-step labels
}

export const WizardProgress: React.FC<WizardProgressProps> = ({ current, total, labels }) => {
  const pct = total > 1 ? (current / (total - 1)) * 100 : 0;
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>Progress</Typography>
        <Typography variant="caption" color="text.secondary">{current + 1} / {total}</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4 }} />
      {labels && labels.length === total && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {labels.map((l, i) => (
            <Typography key={l} variant="caption" sx={{ flex: 1, textAlign: 'center', opacity: i === current ? 1 : 0.45, fontWeight: i === current ? 600 : 400 }}>
              {l}
            </Typography>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default WizardProgress;
