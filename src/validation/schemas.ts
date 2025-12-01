import { z } from 'zod';

const optionalEmail = z.string().optional().refine(v => !v || /.+@.+\..+/.test(v), { message: 'Invalid email' });
const phoneRule = z.string().min(9, { message: 'Phone required' });

export const customerSchema = z.object({
  firstName: z.string().min(2, { message: 'First name required' }),
  lastName: z.string().min(2, { message: 'Last name required' }),
  phone: phoneRule,
  email: z.string().min(1, { message: 'Email required' }).email({ message: 'Invalid email format' }),
  address: z.string().min(5, { message: 'Address required' }),
  nrc: z.string().min(5, { message: 'NRC required' }),
  nrcIssueDate: z.string().min(1, { message: 'NRC issue date required' }),
  dateOfBirth: z.string().min(1, { message: 'Date of birth required' }),
  title: z.string().min(1, { message: 'Title required' }),
  city: z.string().min(2, { message: 'City/District required' }),
  province: z.string().min(2, { message: 'Province required' }),
  postalCode: z.string().optional(),
  preferredBranch: z.string().min(2, { message: 'Please select your nearest branch' }),
  purpose: z.string().optional(),
  gender: z.string().min(1, { message: 'Gender required' }),
  nationality: z.string().optional(),
  otherNationality: z.string().optional(),
  occupation: z.string().optional(),
  maritalStatus: z.string().min(1, { message: 'Marital status required' }),
  accommodationType: z.string().optional(),
  employerName: z.string().min(2, { message: 'Employer name required' }),
  employerId: z.string().optional(),
  payrollNumber: z.string().optional(),
  salary: z.coerce.number().min(0, { message: 'Salary required' }),
  employmentDate: z.string().min(1, { message: 'Employment date required' }),
  employmentType: z.string().min(1, { message: 'Employment type required' }),
  bankName: z.string().min(2, { message: 'Bank name required' }),
  bankBranch: z.string().min(2, { message: 'Bank branch required' }),
  accountNumber: z.string().min(5, { message: 'Account number required' }),
  accountType: z.string().min(1, { message: 'Account type required' }),
  nextOfKin: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: phoneRule.optional(),
    email: optionalEmail,
    address: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    nrc: z.string().optional(),
    nationality: z.string().optional(),
    relationship: z.string().optional()
  }).optional(),
  reference: z.object({
    name: z.string().optional(),
    phone: phoneRule.optional(),
    email: optionalEmail,
    address: z.string().optional(),
    nrc: z.string().optional(),
    relationship: z.string().optional()
  }).optional()
});

// Base calculator schema - additional validation is done in the component level
export const calculatorSchema = z.object({
  amount: z.coerce.number().min(100, { message: 'Min 100' }),
  tenureMonths: z.coerce.number().min(1, { message: 'Tenure required' }).max(60, { message: 'Max 60 months' })
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
export type CalculatorFormValues = z.infer<typeof calculatorSchema>;
