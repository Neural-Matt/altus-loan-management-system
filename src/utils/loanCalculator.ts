// Reusable local loan calculation utility mirroring the hero quick estimate logic.
// Updated rates and product structure based on new business requirements.

export type LocalLoanInstallment = {
  month: number;
  openingBalance: number;
  interestPortion: number;
  principalPortion: number;
  installment: number;
  closingBalance: number;
};

export type LocalLoanEstimate = {
  monthlyInstallment: number;
  totalInterest: number;
  totalPayable: number;
  monthlyRate: number; // raw monthly rate used
  schedule: LocalLoanInstallment[];
};

export type LoanTypeKey = 'instant-salary-advance' | 'corporate-payroll' | 'government-personal' | 'zambia-army' | 'zambia-airforce';

// Product definitions with tenure limits and interest rate structures
export const LOAN_PRODUCTS = {
  'instant-salary-advance': {
    name: 'Instant Salary Advances',
    maxTenureMonths: 3,
    rateStructure: [
      { minAmount: 500, maxAmount: 900, monthlyRate: 0.30 }, // 30% monthly
      { minAmount: 1000, maxAmount: 2500, monthlyRate: 0.25 }, // 25% monthly  
      { minAmount: 3000, maxAmount: 5000, monthlyRate: 0.18 } // 18% monthly
    ]
  },
  'corporate-payroll': {
    name: 'Corporate Payroll',
    maxTenureMonths: 24,
    rateStructure: [
      { minAmount: 0, maxAmount: Number.MAX_SAFE_INTEGER, monthlyRate: 0.05 } // 5% monthly for all amounts
    ]
  },
  'government-personal': {
    name: 'Government Personal Loans',
    maxTenureMonths: 60,
    rateStructure: [
      { minAmount: 0, maxAmount: 14999, monthlyRate: 0.05 }, // 5% monthly below 15000
      { minAmount: 15000, maxAmount: Number.MAX_SAFE_INTEGER, monthlyRate: 0.045 } // 4.5% monthly above 15000
    ]
  },
  'zambia-army': {
    name: 'Zambia Army Loans',
    maxTenureMonths: 60,
    rateStructure: [
      { minAmount: 0, maxAmount: 14999, monthlyRate: 0.05 }, // 5% monthly below 15000
      { minAmount: 15000, maxAmount: Number.MAX_SAFE_INTEGER, monthlyRate: 0.045 } // 4.5% monthly above 15000
    ]
  },
  'zambia-airforce': {
    name: 'Zambia Airforce Loans',
    maxTenureMonths: 60,
    rateStructure: [
      { minAmount: 0, maxAmount: 14999, monthlyRate: 0.05 }, // 5% monthly below 15000
      { minAmount: 15000, maxAmount: Number.MAX_SAFE_INTEGER, monthlyRate: 0.045 } // 4.5% monthly above 15000
    ]
  }
};

// Get the appropriate monthly rate for a loan amount and product type
function getMonthlyRate(amount: number, loanType: LoanTypeKey): number {
  const product = LOAN_PRODUCTS[loanType];
  const applicableRate = product.rateStructure.find(tier => 
    amount >= tier.minAmount && amount <= tier.maxAmount
  );
  
  if (!applicableRate) {
    throw new Error(`No rate structure found for amount ${amount} in product ${loanType}`);
  }
  
  return applicableRate.monthlyRate;
}

// Get maximum tenure for a product type
export function getMaxTenure(loanType: LoanTypeKey): number {
  return LOAN_PRODUCTS[loanType].maxTenureMonths;
}

// Validate if amount is within allowed range for the product
export function validateLoanAmount(amount: number, loanType: LoanTypeKey): { valid: boolean; message?: string } {
  // For instant salary advances, check specific amount ranges
  if (loanType === 'instant-salary-advance') {
    if (amount < 500) {
      return { valid: false, message: 'Minimum amount for Instant Salary Advances is K500' };
    }
    if (amount > 5000) {
      return { valid: false, message: 'Maximum amount for Instant Salary Advances is K5000' };
    }
  }
  
  return { valid: true };
}

// Get all available loan products for UI display
export function getLoanProducts(): Array<{ key: LoanTypeKey; name: string; maxTenure: number }> {
  return Object.entries(LOAN_PRODUCTS).map(([key, product]) => ({
    key: key as LoanTypeKey,
    name: product.name,
    maxTenure: product.maxTenureMonths
  }));
}

export interface CalcInput {
  principal: number; // amount
  tenureMonths: number;
  loanType?: LoanTypeKey; // optional; default instant-salary-advance
}

// Simple declining balance schedule: interest each month = current balance * rate; principal = installment - interest.
// Installment derived from linear interest approximation used earlier for UI parity.
export function computeLocalLoanEstimate({ principal, tenureMonths, loanType = 'instant-salary-advance' }: CalcInput): LocalLoanEstimate {
  if (principal <= 0 || tenureMonths <= 0) {
    throw new Error('Principal and tenure must be positive');
  }
  
  // Validate loan amount for the product type
  const amountValidation = validateLoanAmount(principal, loanType);
  if (!amountValidation.valid) {
    throw new Error(amountValidation.message);
  }
  
  // Validate tenure for the product type
  const maxTenure = getMaxTenure(loanType);
  if (tenureMonths > maxTenure) {
    throw new Error(`Maximum tenure for ${LOAN_PRODUCTS[loanType].name} is ${maxTenure} months`);
  }
  
  const rate = getMonthlyRate(principal, loanType);
  const totalPayable = Math.round(principal * (1 + rate * tenureMonths));
  const monthlyInstallment = Math.round(totalPayable / tenureMonths);
  const schedule: LocalLoanInstallment[] = [];
  let balance = principal;
  let totalInterest = 0;
  for (let m=1; m<=tenureMonths; m++) {
    const opening = balance;
    const interest = Math.round(opening * rate);
    let principalPortion = monthlyInstallment - interest;
    if (principalPortion > balance) principalPortion = balance; // final adjustment
    const closing = opening - principalPortion;
    totalInterest += interest;
    schedule.push({
      month: m,
      openingBalance: opening,
      interestPortion: interest,
      principalPortion,
      installment: interest + principalPortion,
      closingBalance: closing < 1 ? 0 : closing
    });
    balance = closing;
  }
  const totalPayableAdj = principal + totalInterest;
  return { monthlyInstallment, totalInterest, totalPayable: totalPayableAdj, monthlyRate: rate, schedule };
}
