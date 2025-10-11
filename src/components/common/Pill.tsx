import React from 'react';
import { Box } from '@mui/material';

export interface PillProps {
  label: string;
  value?: React.ReactNode;
  color?: 'primary' | 'default';
  outlined?: boolean;
  icon?: React.ReactNode;
}

export const Pill: React.FC<PillProps> = ({ label, value, color='default', outlined=false, icon }) => {
  const isPrimary = color === 'primary';
  return (
    <Box sx={{
      display:'inline-flex', alignItems:'center', gap:0.75,
      bgcolor: outlined ? 'transparent' : (isPrimary ? '#011A41' : '#F1F5FA'),
      color: isPrimary ? '#FFFFFF' : '#011A41',
      px:1.6, py:0.7,
      borderRadius:999,
      fontSize:13,
      fontWeight:600,
      letterSpacing:0.3,
      position:'relative',
      lineHeight:1,
      border: outlined ? '1px solid #011A41' : '1px solid transparent',
      boxShadow: isPrimary ? '0 2px 6px rgba(1,26,65,0.35)' : '0 1px 3px rgba(0,0,0,0.08)',
      animation:'pillFade 0.5s ease'
    }}>
      <style>{`@keyframes pillFade { from { opacity:0; transform: translateY(4px); } to { opacity:1; transform: translateY(0); } }`}</style>
      {icon && <Box sx={{ display:'flex', alignItems:'center', fontSize:16, opacity:0.85 }}>{icon}</Box>}
      <span style={{ opacity:.75 }}>{label}:</span>
      <span style={{ fontWeight:700 }}>{value || '—'}</span>
    </Box>
  );
};
