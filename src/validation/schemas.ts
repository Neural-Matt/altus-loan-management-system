import { z } from 'zod';

const optionalEmail = z.string().optional().refine(v => !v || /.+@.+\..+/.test(v), { message: 'Invalid email' });
const phoneRule = z.string().min(9, { message: 'Phone required' });

export const customerSchema = z.object({
  firstName: z.string().min(2, { message: 'First name required' }),
  lastName: z.string().min(2, { message: 'Last name required' }),
  phone: phoneRule,
  email: optionalEmail,
  address: z.string().optional(),
  nrc: z.string().min(5, { message: 'NRC required' }),
  purpose: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  otherNationality: z.string().optional(),
  occupation: z.string().optional(),
  maritalStatus: z.string().optional(),
  accommodationType: z.string().optional(),
  employerName: z.string().optional(),
  payrollNumber: z.string().optional(),
  nextOfKin: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: phoneRule.optional(),
    email: optionalEmail,
    address: z.string().optional(),
    nrc: z.string().optional(),
    nationality: z.string().optional(),
    relationship: z.string().optional()
  }).optional(),
  reference: z.object({
    name: z.string().optional(),
    phone: phoneRule.optional(),
    email: optionalEmail,
    address: z.string().optional()
  }).optional()
});

// Base calculator schema - additional validation is done in the component level
export const calculatorSchema = z.object({
  amount: z.coerce.number().min(100, { message: 'Min 100' }),
  tenureMonths: z.coerce.number().min(1, { message: 'Tenure required' }).max(60, { message: 'Max 60 months' })
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
export type CalculatorFormValues = z.infer<typeof calculatorSchema>;
