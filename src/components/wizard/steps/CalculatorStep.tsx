import React, { useEffect, useState, useRef } from 'react';
// TODO: Replace 'any' EMI response typing with concrete LoanCalculatorResult interface once backend shape confirmed.
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { calculatorSchema, CalculatorFormValues } from '../../../validation/schemas';
import { Box, Typography, Divider, InputAdornment, ToggleButtonGroup, ToggleButton, Paper, Stack, Collapse, IconButton, Tooltip, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import { FormTextField } from '../../form/FormTextField';
import { useWizardData } from '../WizardDataContext';
import { computeLocalLoanEstimate, LoanTypeKey, getLoanProducts, getMaxTenure } from '../../../utils/loanCalculator';
import { useSnackbar } from '../../feedback/SnackbarProvider';

export const CalculatorStep: React.FC = () => {
  const { loan, setLoan } = useWizardData();
  const { push } = useSnackbar();
  // Removed API dependency; no loading state required, can reintroduce when backend integration returns
  const [error, setError] = useState<string | null>(null);
  const [loanType, setLoanType] = useState<LoanTypeKey>('instant-salary-advance');
  const [showSchedule, setShowSchedule] = useState(false);

  // Get available loan products
  const loanProducts = getLoanProducts();

  // Because z.coerce.number() accepts string input, the raw form values prior to resolver parsing
  // can be string | number. Define an Input type that matches what the form fields actually emit.
  type CalculatorFormInput = { amount: number | string; tenureMonths: number | string };
  const { control, handleSubmit, watch, reset } = useForm<CalculatorFormInput, any, CalculatorFormValues>({
    defaultValues: {
      amount: loan.amount || 0,
      tenureMonths: loan.tenureMonths || 12
    },
  resolver: zodResolver(calculatorSchema) as any, // Cast due to react-hook-form resolver generic limitations with coerced schemas
    mode: 'onBlur'
  });

  // Keep form synced if context changes (e.g., product pre-selection)
  useEffect(() => {
    reset({
      amount: loan.amount || 0,
      tenureMonths: loan.tenureMonths || 12
    });
  }, [loan, reset]);

  const performCalc = (values: CalculatorFormValues) => {
    setError(null);
    try {
      if (!values.amount || !values.tenureMonths) {
        setLoan({ amount: values.amount, tenureMonths: values.tenureMonths, productCode: loanType, emiResult: undefined });
        return;
      }
      const est = computeLocalLoanEstimate({ principal: values.amount, tenureMonths: values.tenureMonths, loanType });
      setLoan({
        amount: values.amount,
        tenureMonths: values.tenureMonths,
        productCode: loanType,
        emiResult: {
          monthlyInstallment: est.monthlyInstallment,
            totalInterest: est.totalInterest,
            totalPayable: est.totalPayable,
            schedule: est.schedule.map(r => ({
              month: r.month,
              openingBalance: r.openingBalance,
              interestPortion: r.interestPortion,
              principalPortion: r.principalPortion,
              installment: r.installment,
              closingBalance: r.closingBalance
            }))
        }
      });
    } catch (e: any) {
      setError(e.message || 'Calculation failed');
    }
  };

  const onValid: SubmitHandler<CalculatorFormValues> = (values) => performCalc(values);
  
  // Validator to ensure amount and tenure are filled before proceeding
  (window as any).__calculatorStepSubmit = async () => {
    if (!loan.amount || loan.amount < 100) {
      push('⚠️ Please enter a loan amount (minimum ZMW 100)', 'error');
      return false;
    }
    if (!loan.tenureMonths || loan.tenureMonths < 1) {
      push('⚠️ Please enter the loan tenure (number of months)', 'error');
      return false;
    }
    return true;
  };

  // Realtime calculation (debounced) on watched values
  const debounceRef = useRef<number | null>(null);
  const watched = watch();
  useEffect(() => {
    // Basic debounce to avoid rapid recompute while typing
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      // Validate via resolver then compute on success
      handleSubmit(onValid as any)();
    }, 250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched.amount, watched.tenureMonths, loanType]);
  const formatNumber = (n?: number) => typeof n === 'number' && !isNaN(n) ? n.toLocaleString() : '-';

  const exportCsv = () => {
    if (!loan.emiResult?.schedule) return;
    const rows = [
      ['Month','Opening Balance','Interest','Principal','Installment','Closing Balance'],
      ...loan.emiResult.schedule.map(r => [r.month, r.openingBalance, r.interestPortion, r.principalPortion, r.installment, r.closingBalance])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amortization_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Loan Calculator</Typography>
      {/* Result card positioned above inputs */}
      <Paper elevation={0} sx={{
        mb:3,
        p:{ xs:2.5, sm:3 },
        borderRadius:3,
        position:'relative',
        background:'linear-gradient(135deg, #011A41 0%, #07306E 55%, #73B62B 140%)',
        color:'#FFFFFF',
        overflow:'hidden',
        textAlign:'center'
      }}>
        <Box sx={{ position:'absolute', inset:0, opacity:0.15, background:'radial-gradient(circle at 85% 15%, #FFFFFF 0%, transparent 60%)' }} />
        <Typography variant="subtitle2" sx={{ fontWeight:600, mb:1, position:'relative' }}>Current Estimate</Typography>
        {loan.emiResult ? (
          <Stack direction={{ xs:'column', md:'row' }} spacing={{ xs:2.5, md:4 }} sx={{ position:'relative', flexWrap:'wrap', justifyContent:'center' }}>
            <EstimateMetric label="Principal" value={`ZMW ${formatNumber(loan.amount)}`} emphasized />
            <EstimateMetric label="Monthly" value={`ZMW ${formatNumber(loan.emiResult.monthlyInstallment)}`} />
            <EstimateMetric label="Total Payable" value={`ZMW ${formatNumber(loan.emiResult.totalPayable)}`} />
            <EstimateMetric label="Total Interest" value={`ZMW ${formatNumber(loan.emiResult.totalInterest)}`} />
            <EstimateMetric label="Interest %" value={loan.emiResult.totalInterest && loan.amount ? `${Math.round((loan.emiResult.totalInterest/loan.amount)*100)}%` : '-'} />
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ opacity:0.8, position:'relative' }}>Enter amount & tenure to see live estimate.</Typography>
        )}
        {error && <Typography variant="caption" sx={{ color:'#FFD9D9', mt:1, position:'relative' }}>{error}</Typography>}
  <Typography variant="caption" sx={{ display:'block', mt:2.5, opacity:0.65, position:'relative' }}>Tentative loan calculation for repayment estimation.</Typography>
      </Paper>
      <ToggleButtonGroup
        color="primary"
        exclusive
        size="small"
        value={loanType}
        onChange={(_, v) => v && setLoanType(v)}
        sx={{ mb:2, flexWrap:'wrap', gap:1,
          '& .MuiToggleButton-root': { px:2, py:0.6, borderRadius:999, textTransform:'none', fontSize:12, fontWeight:600 },
          '& .Mui-selected': { bgcolor:'#011A41 !important', color:'#fff !important' }
        }}
      >
        {loanProducts.map(product => (
          <ToggleButton key={product.key} value={product.key}>
            {product.name}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Box sx={{ display:'grid', gap:2, gridTemplateColumns:{ xs:'1fr', sm:'1fr 1fr' } }}>
        <FormTextField
          type="number"
          name="amount"
          control={control}
          label="Amount"
          InputProps={{
            startAdornment: (<InputAdornment position="start">ZMW</InputAdornment>),
            inputMode:'numeric'
          }}
        />
        <FormTextField 
          type="number" 
          name="tenureMonths" 
          control={control} 
          label={`Tenure (Months) - Max: ${getMaxTenure(loanType)}`}
          inputProps={{
            max: getMaxTenure(loanType),
            min: 1
          }}
        />
      </Box>
      <Divider sx={{ my:3 }} />
      <Typography variant="caption" sx={{ mt:0, display:'block', color:'text.secondary' }}>
        Live update: amount {watched.amount || '-'}, tenure {watched.tenureMonths || '-'} (loan type: {loanProducts.find(p => p.key === loanType)?.name})
      </Typography>
      {loan.emiResult?.schedule && (
        <Box sx={{ mt:3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton size="small" onClick={()=>setShowSchedule(s=>!s)} aria-label={showSchedule? 'Hide amortization schedule':'Show amortization schedule'}>
              <ExpandMoreIcon sx={{ transform: showSchedule ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform .25s' }} />
            </IconButton>
            <Typography variant="subtitle2" sx={{ fontWeight:600 }}>Amortization Schedule</Typography>
            <Tooltip title="Download CSV of schedule"><span><IconButton size="small" onClick={exportCsv} aria-label="Export schedule CSV"><DownloadIcon fontSize="small" /></IconButton></span></Tooltip>
          </Stack>
          <Collapse in={showSchedule} timeout="auto" unmountOnExit>
            <TableContainer sx={{ mt:1.5, maxHeight:280, border:'1px solid', borderColor:'divider', borderRadius:2 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {['Month','Opening','Interest','Principal','Install','Closing'].map(h => <TableCell key={h} sx={{ fontSize:12, fontWeight:600 }}>{h}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loan.emiResult.schedule.map(row => (
                    <TableRow key={row.month}>
                      <TableCell>{row.month}</TableCell>
                      <TableCell>{row.openingBalance.toLocaleString()}</TableCell>
                      <TableCell>{row.interestPortion.toLocaleString()}</TableCell>
                      <TableCell>{row.principalPortion.toLocaleString()}</TableCell>
                      <TableCell>{row.installment.toLocaleString()}</TableCell>
                      <TableCell>{row.closingBalance.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

// Small animated metric component
const EstimateMetric: React.FC<{ label: string; value: string | number; emphasized?: boolean; }> = ({ label, value, emphasized }) => {
  return (
    <Box sx={{ minWidth:{ xs:120, md:140 }, px:0.5 }}>
      <Typography variant="caption" sx={{ letterSpacing:0.7, opacity:0.75 }}>{label.toUpperCase()}</Typography>
      <Typography
        variant={emphasized ? 'h5' : 'h6'}
        sx={{
          fontWeight:800,
          lineHeight:1.05,
          mt:0.5,
          letterSpacing:0.3,
          textShadow:'0 2px 6px rgba(0,0,0,0.25)',
          animation:'fadeSlide 0.45s ease'
        }}
        key={String(value)}
      >{value}</Typography>
      <style>{`@keyframes fadeSlide { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }`}</style>
    </Box>
  );
};
