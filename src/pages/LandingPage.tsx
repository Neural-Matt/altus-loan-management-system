import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Card, CardContent, Divider, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import SavingsIcon from '@mui/icons-material/Savings';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import CalculateIcon from '@mui/icons-material/Calculate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const loanCatalog = [
  {
    category: 'Personal Loans',
    key: 'personal',
    description: 'Flexible short to medium term credit tailored to your individual needs.',
    items: [
      { key: 'instant-salary-advance', label: 'Instant Salary Advance', blurb: 'Fast access to a portion of earned salary before payday.' },
      { key: 'corporate-payroll', label: 'Corporate Payroll Loan', blurb: 'Structured repayment via employer payroll deduction.' },
      { key: 'non-payroll', label: 'Non Payroll Loan', blurb: 'For individuals without a payroll integration.' }
    ]
  },
  {
    category: 'Pre-Approved Programmes',
    key: 'pre-approved',
    description: 'Preferential credit journeys for approved institutions and government bodies.',
    items: [
      { key: 'zambia-army', label: 'Zambia Army Employees', blurb: 'Dedicated facility with streamlined verification.' },
      { key: 'zambia-airforce', label: 'Zambia Airforce Employees', blurb: 'Program benefits with fast-track assessment.' },
      { key: 'grz-employees', label: 'GRZ Employees', blurb: 'Government worker pre-approval pathway.' }
    ]
  }
];

export const LandingPage: React.FC = () => {
  const [calcAmount, setCalcAmount] = useState<number | ''>('');
  const [calcTenure, setCalcTenure] = useState<number | ''>('');
  const [estimate, setEstimate] = useState<{ monthly:number; total:number; interestPct:number } | null>(null);
  const [loanType, setLoanType] = useState<'instant-salary-advance' | 'corporate-payroll' | 'government-personal' | 'zambia-army' | 'zambia-airforce'>('instant-salary-advance');
  const navigate = useNavigate();

  const runQuickEstimate = () => {
    if (!calcAmount || !calcTenure) { setEstimate(null); return; }
    // Use the same calculation logic as the main calculator
    import('../utils/loanCalculator').then(({ computeLocalLoanEstimate }) => {
      try {
        const result = computeLocalLoanEstimate({ 
          principal: Number(calcAmount), 
          tenureMonths: Number(calcTenure), 
          loanType 
        });
        setEstimate({ 
          monthly: result.monthlyInstallment, 
          total: result.totalPayable, 
          interestPct: Math.round((result.totalInterest / Number(calcAmount)) * 100) 
        });
      } catch (error) {
        console.error('Estimation failed:', error);
        setEstimate(null);
      }
    }).catch(error => {
      console.error('Failed to load calculator:', error);
      setEstimate(null);
    });
  };

  return (
    <AppLayout>
      {/* Full-width Hero Section (edge-to-edge) */}
      <Box sx={{
        position:'relative',
  mt:0,
        mb:10,
        width:'100vw', left:'50%', right:'50%', ml:'-50vw', mr:'-50vw',
        overflow:'hidden',
        backgroundImage:'url(https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=2000&q=70)',
        backgroundSize:'cover', backgroundPosition:'center'
      }}>
        <Box sx={{ position:'absolute', inset:0, background:'linear-gradient(115deg, rgba(1,26,65,0.88) 0%, rgba(1,26,65,0.75) 45%, rgba(115,182,43,0.55) 100%)' }} />
        <Box sx={{ position:'relative', display:'grid', gridTemplateColumns:{ xs:'1fr', lg:'1fr 420px' }, gap:{ xs:6, md:10 }, px:{ xs:4, md:10 }, py:{ xs:10, md:14 }, alignItems:'center' }}>
          {/* Text Block */}
          <Box>
            <Typography variant="h2" sx={{ fontSize:{ xs:'2.2rem', md:'3rem' }, fontWeight:800, lineHeight:1.1, mb:3, color:'#FFFFFF', textShadow:'0 4px 18px rgba(0,0,0,0.35)' }}>
              Smart, Fast & Transparent<br />Personal Lending Solutions
            </Typography>
            <Stack spacing={2} sx={{ mb:4 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SpeedIcon color="success" />
                <Typography variant="body1" sx={{ fontWeight:500, color:'#FFFFFF' }}>Rapid approvals with streamlined checks.</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <SecurityIcon color="success" />
                <Typography variant="body1" sx={{ fontWeight:500, color:'#FFFFFF' }}>Bank‑grade security & data privacy.</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <SavingsIcon color="success" />
                <Typography variant="body1" sx={{ fontWeight:500, color:'#FFFFFF' }}>Competitive rates & flexible tenures.</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleIcon color="success" />
                <Typography variant="body1" sx={{ fontWeight:500, color:'#FFFFFF' }}>Track your application anytime.</Typography>
              </Stack>
            </Stack>
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
              <Button variant="contained" size="large" onClick={() => navigate('/#loan-categories')} sx={{ fontWeight:700 }}>Explore Loans</Button>
              <Button size="large" onClick={() => navigate('/apply/personal/instant-salary-advance')} startIcon={<CalculateIcon />} sx={{ fontWeight:700, bgcolor:'#FFFFFF', color:'#011A41', '&:hover':{ bgcolor:'#F5F8FA' } }}>Apply Now</Button>
              <Button variant="outlined" size="large" onClick={() => navigate('/track')} sx={{ fontWeight:700, borderColor:'#FFFFFF', color:'#FFFFFF', '&:hover':{ borderColor:'#FFFFFF', bgcolor:'rgba(255,255,255,0.12)' } }}>Track Application</Button>
            </Stack>
          </Box>
          {/* Calculator Card */}
          <Card sx={{ borderRadius:5, boxShadow:'0 6px 22px rgba(1,26,65,0.25)', position:'relative', overflow:'hidden', background:'#FFFFFF', border:'1px solid #E5E9F0' }}>
            <CardContent sx={{ position:'relative', p:{ xs:3.5, md:4 } }}>
              <Typography variant="h6" sx={{ fontWeight:800, mb:2, color:'#011A41', letterSpacing:.3 }}>Quick Estimate</Typography>
              <ToggleButtonGroup
                color="primary"
                exclusive
                size="small"
                value={loanType}
                onChange={(_, v) => v && setLoanType(v)}
                sx={{
                  mb:2,
                  display:'flex',
                  flexWrap:'wrap',
                  gap:1,
                  '& .MuiToggleButton-root': {
                    px:2, py:0.6, borderRadius:999, textTransform:'none', fontSize:12, fontWeight:600,
                    border:'1px solid rgba(1,26,65,0.15)',
                  },
                  '& .Mui-selected': {
                    bgcolor:'#011A41 !important',
                    color:'#fff !important',
                    borderColor:'#011A41'
                  }
                }}
              >
                <ToggleButton value="instant-salary-advance">Instant Salary Advance</ToggleButton>
                <ToggleButton value="corporate-payroll">Corporate Payroll</ToggleButton>
                <ToggleButton value="government-personal">Government Personal</ToggleButton>
                <ToggleButton value="zambia-army">Zambia Army</ToggleButton>
                <ToggleButton value="zambia-airforce">Zambia Airforce</ToggleButton>
              </ToggleButtonGroup>
              <TextField label="Amount" type="number" fullWidth size="small" value={calcAmount} onChange={e => setCalcAmount(e.target.value ? Number(e.target.value) : '')} sx={{ mb:2 }} />
              <TextField label="Tenure (Months)" type="number" fullWidth size="small" value={calcTenure} onChange={e => setCalcTenure(e.target.value ? Number(e.target.value) : '')} sx={{ mb:2 }} />
              <Button fullWidth variant="contained" onClick={runQuickEstimate} sx={{ py:1.1, fontWeight:700 }}>Calculate</Button>
              <Divider sx={{ my:2.5 }} />
              {estimate ? (
                <Box>
                  <Typography variant="body2" sx={{ mb:0.5 }}>Monthly Payment: <strong>{estimate.monthly.toLocaleString()}</strong></Typography>
                  <Typography variant="caption" sx={{ display:'block', mb:0.5 }}>Total Repayable: <strong>{estimate.total.toLocaleString()}</strong></Typography>
                  <Typography variant="caption" sx={{ display:'block', mb:0.5 }}>Approx. Interest: <strong>{estimate.interestPct}%</strong></Typography>
                  <Typography variant="caption" sx={{ display:'block', mt:1, color:'text.secondary' }}>This is a tentative illustration and not a loan offer.</Typography>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color:'text.secondary' }}>Enter amount, tenure & choose a loan type.</Typography>
              )}
              {!estimate && <Typography variant="caption" sx={{ display:'block', mt:1, color:'text.secondary' }}>Results are indicative only.</Typography>}
              <Button size="small" sx={{ mt:2 }} onClick={() => navigate('/apply/personal/instant-salary-advance')}>Proceed to Full Application →</Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <Box id="loan-categories" sx={{ display:'grid', gap:4, gridTemplateColumns:{ xs:'1fr', md:'1fr 1fr' }, mb:10 }}>
        {loanCatalog.map(cat => (
          <Box key={cat.key} sx={{ background:'#FFFFFF', p:{ xs:3, md:4 }, borderRadius:4, boxShadow:'0 4px 16px rgba(1,26,65,0.10)', display:'flex', flexDirection:'column' }}>
            <Typography variant="h4" sx={{ fontSize:{ xs:'1.3rem', md:'1.6rem' }, fontWeight:600, mb:1, color:'#011A41', display:'flex', alignItems:'center', gap:1 }}>
              {cat.key === 'personal' ? <SavingsIcon color="success" /> : <SecurityIcon color="success" />}
              {cat.category}
            </Typography>
            <Typography variant="body2" sx={{ mb:2, color:'text.secondary' }}>{cat.description}</Typography>
            <Stack spacing={1.2} sx={{ flexGrow:1 }}>
              {cat.items.map(item => (
                <Box key={item.key} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', p:1.2, border:'1px solid #e2e8f0', borderRadius:2, bgcolor:'#FAFAFC', '&:hover':{ borderColor:'#73B62B', bgcolor:'#F4FFF7' } }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight:600 }}>{item.label}</Typography>
                    <Typography variant="caption" sx={{ color:'text.secondary' }}>{item.blurb}</Typography>
                  </Box>
                  <Button component={Link} to={`/apply/${cat.key}/${item.key}`} size="small" variant="contained" sx={{ fontSize:12 }}>Apply</Button>
                </Box>
              ))}
            </Stack>
            <Button component={Link} to={`/apply/${cat.key}/${cat.items[0].key}`} variant="outlined" size="small" sx={{ mt:3, alignSelf:'flex-start' }}>Start in {cat.category.split(' ')[0]}</Button>
          </Box>
        ))}
      </Box>

      <Box sx={{ textAlign:'center' }}>
        <Button component={Link} to="/track" variant="outlined" size="large" sx={{ mr: 2 }}>Track Existing Application</Button>
        <Button component={Link} to="/test-apis" variant="outlined" size="large" color="secondary">🧪 Test APIs</Button>
      </Box>
    </AppLayout>
  );
};
