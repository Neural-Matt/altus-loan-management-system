import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, CustomerFormValues } from '../../../validation/schemas';
import { Box, Typography, Paper, Collapse, IconButton, Stack, MenuItem } from '@mui/material';
import { FormTextField } from '../../form/FormTextField';
import { FormNRCField } from '../../form/FormNRCField';
import { useWizardData } from '../WizardDataContext';
import { useAltus } from '../../../context/AltusContext';
import { useSnackbar } from '../../feedback/SnackbarProvider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const CustomerStep: React.FC = () => {
  const { customer, setCustomer } = useWizardData();
  const { createRetailCustomer } = useAltus();
  const { push } = useSnackbar();
  const [openKin, setOpenKin] = React.useState(true);
  const [openRef, setOpenRef] = React.useState(false);

  const { control, handleSubmit, reset, watch } = useForm<CustomerFormValues>({
    defaultValues: {
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      nrc: customer.nrc || '',
      purpose: customer.purpose || '',
      gender: customer.gender || '',
      nationality: customer.nationality || '',
      otherNationality: customer.otherNationality || '',
      occupation: customer.occupation || '',
      maritalStatus: customer.maritalStatus || '',
      accommodationType: customer.accommodationType || '',
      employerName: customer.employerName || '',
      payrollNumber: customer.payrollNumber || '',
      nextOfKin: customer.nextOfKin || {},
      reference: customer.reference || {}
    },
    resolver: zodResolver(customerSchema),
    mode: 'onBlur'
  });

  // Watch nationality field to conditionally show other nationality input
  const nationalityValue = watch('nationality');

  useEffect(() => {
    reset({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      nrc: customer.nrc || '',
      purpose: customer.purpose || '',
      gender: customer.gender || '',
      nationality: customer.nationality || '',
      otherNationality: customer.otherNationality || '',
      occupation: customer.occupation || '',
      maritalStatus: customer.maritalStatus || '',
      accommodationType: customer.accommodationType || '',
      employerName: customer.employerName || '',
      payrollNumber: customer.payrollNumber || '',
      nextOfKin: customer.nextOfKin || {},
      reference: customer.reference || {}
    });
  }, [customer, reset]);

  const onValid = async (values: CustomerFormValues) => { 
    try {
      // Update wizard data first
      setCustomer(values);
      
      // Transform wizard data to Altus API format
      const customerRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        nrc: values.nrc,
        phoneNumber: values.phone,
        emailAddress: values.email,
        dateOfBirth: "1990-01-01", // TODO: Add date of birth field to form
        gender: values.gender as "Male" | "Female",
        nationality: values.nationality === 'Other' ? values.otherNationality || '' : values.nationality || '',
        otherNationality: values.nationality === 'Other' ? values.otherNationality : undefined,
        maritalStatus: values.maritalStatus || '',
        address: {
          street: values.address || '',
          city: "Lusaka", // TODO: Add city field to form
          province: "Lusaka", // TODO: Add province field to form
          country: "Zambia"
        },
        employment: {
          employerId: "EMP001", // TODO: Add employer ID field to form
          employerName: values.employerName || '',
          employerCode: values.payrollNumber || '',
          position: values.occupation || '',
          salary: 0, // TODO: Add salary field to form
          employmentDate: "2020-01-01", // TODO: Add employment date field to form
          employmentType: "Permanent" as const
        },
        nextOfKin: {
          firstName: values.nextOfKin?.firstName || '',
          lastName: values.nextOfKin?.lastName || '',
          relationship: values.nextOfKin?.relationship || '',
          phoneNumber: values.nextOfKin?.phone || '',
          address: values.nextOfKin?.address
        }
      };

      // Call the API and wait for the response
      console.log('🧑‍💼 Creating customer with API...', customerRequest);
      const createdCustomer = await createRetailCustomer(customerRequest);
      
      if (createdCustomer && createdCustomer.customerId) {
        console.log('✅ Customer created successfully:', createdCustomer.customerId);
        
        // Update wizard data with the returned customer ID and API data
        setCustomer({
          ...values,
          customerId: createdCustomer.customerId,
          apiCustomerData: createdCustomer // Store the full API response
        });
        
        push(`Customer created successfully! ID: ${createdCustomer.customerId}`, 'success');
      } else {
        console.warn('⚠️ Customer creation returned no data');
        push('Customer details saved locally, but API integration may have failed.', 'warning');
      }
    } catch (err) {
      console.error('❌ Error creating customer:', err);
      push('Failed to save customer details. Please try again.', 'error');
      throw err; // Re-throw to prevent wizard from advancing
    }
  };
  (window as any).__customerStepSubmit = handleSubmit(onValid, () => false);

  const Section: React.FC<{ title: string; subtitle?: string; toggle?: boolean; open?: boolean; onToggle?: () => void; children: React.ReactNode; }> = ({ title, subtitle, toggle, open=true, onToggle, children }) => (
    <Paper elevation={0} sx={{ p:2.5, border:'1px solid', borderColor:'divider', borderRadius:3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb:1 }}>
        {toggle && <IconButton size="small" onClick={onToggle} aria-label={open? 'Collapse section':'Expand section'} sx={{ transform: open? 'rotate(180deg)':'rotate(0deg)', transition:'transform .25s' }}><ExpandMoreIcon /></IconButton>}
        <Typography variant="subtitle2" sx={{ fontWeight:600 }}>{title}</Typography>
        {subtitle && <Typography variant="caption" sx={{ color:'text.secondary' }}>{subtitle}</Typography>}
      </Stack>
      <Collapse in={open} unmountOnExit timeout="auto">{children}</Collapse>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Applicant Information</Typography>
      <Stack spacing={2.5}>
        <Section title="Personal Details" subtitle="Core applicant information">
          <Box sx={{ display:'grid', gap:2, gridTemplateColumns:{ xs:'1fr', sm:'1fr 1fr' } }}>
            <Box><FormTextField name="firstName" control={control} label="First Name" /></Box>
            <Box><FormTextField name="lastName" control={control} label="Last Name" /></Box>
            <Box><FormTextField name="phone" control={control} label="Phone Number" /></Box>
            <Box><FormTextField name="email" control={control} label="Email" /></Box>
            <Box sx={{ gridColumn:'1 / -1' }}><FormTextField name="address" control={control} label="Residential Address" /></Box>
            <Box><FormNRCField name="nrc" control={control} label="NRC" /></Box>
            <Box>
              <FormTextField 
                name="purpose" 
                control={control} 
                label="Purpose of Loan"
                select
              >
                <MenuItem value="Grow Business">Grow Business</MenuItem>
                <MenuItem value="Personal Use">Personal Use</MenuItem>
                <MenuItem value="Housing">Housing</MenuItem>
                <MenuItem value="Medication">Medication</MenuItem>
                <MenuItem value="Farming">Farming</MenuItem>
                <MenuItem value="Start/Grow business">Start/Grow business</MenuItem>
                <MenuItem value="Education">Education</MenuItem>
                <MenuItem value="Home improvement">Home improvement</MenuItem>
                <MenuItem value="Building/Purchase home">Building/Purchase home</MenuItem>
                <MenuItem value="Medical expenses">Medical expenses</MenuItem>
                <MenuItem value="Agricultural inputs/Equipment">Agricultural inputs/Equipment</MenuItem>
                <MenuItem value="Furniture/Home appliances">Furniture/Home appliances</MenuItem>
                <MenuItem value="Television/Sound system">Television/Sound system</MenuItem>
                <MenuItem value="Mobile phone">Mobile phone</MenuItem>
                <MenuItem value="Laptop/Tablet">Laptop/Tablet</MenuItem>
                <MenuItem value="Renewable energy/Energy efficiency products">Renewable energy/Energy efficiency products</MenuItem>
                <MenuItem value="Env recycling treatments/operations">Env recycling treatments/operations</MenuItem>
                <MenuItem value="Vehicle/Import duty/Maintenance">Vehicle/Import duty/Maintenance</MenuItem>
                <MenuItem value="School Fees">School Fees</MenuItem>
                <MenuItem value="Debt consolidation">Debt consolidation</MenuItem>
                <MenuItem value="Funeral">Funeral</MenuItem>
                <MenuItem value="Land purchase">Land purchase</MenuItem>
              </FormTextField>
            </Box>
            <Box sx={{ gridColumn:{ xs:'1 / -1', sm:'auto' } }}>
              <FormTextField 
                name="gender" 
                control={control} 
                label="Gender"
                select
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </FormTextField>
            </Box>
            <Box sx={{ gridColumn:{ xs:'1 / -1', sm:'auto' } }}>
              <FormTextField 
                name="nationality" 
                control={control} 
                label="Nationality"
                select
              >
                <MenuItem value="Zambian">Zambian</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </FormTextField>
            </Box>
            {nationalityValue === 'Other' && (
              <Box sx={{ gridColumn:{ xs:'1 / -1', sm:'auto' } }}>
                <FormTextField 
                  name="otherNationality" 
                  control={control} 
                  label="Specify Nationality" 
                  placeholder="Enter your nationality"
                />
              </Box>
            )}
            <Box sx={{ gridColumn:{ xs:'1 / -1', sm:'auto' } }}><FormTextField name="occupation" control={control} label="Occupation" /></Box>
            <Box>
              <FormTextField 
                name="maritalStatus" 
                control={control} 
                label="Marital Status"
                select
              >
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Married">Married</MenuItem>
                <MenuItem value="De facto">De facto</MenuItem>
                <MenuItem value="Divorced">Divorced</MenuItem>
                <MenuItem value="Widow">Widow</MenuItem>
                <MenuItem value="Separated">Separated</MenuItem>
                <MenuItem value="Civil Union">Civil Union</MenuItem>
              </FormTextField>
            </Box>
            <Box>
              <FormTextField 
                name="accommodationType" 
                control={control} 
                label="Accommodation Type"
                select
              >
                <MenuItem value="Tenant">Tenant</MenuItem>
                <MenuItem value="Home Owner">Home Owner</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
                <MenuItem value="Living in Family Home">Living in Family Home</MenuItem>
              </FormTextField>
            </Box>
            <Box><FormTextField name="employerName" control={control} label="Employer" /></Box>
            <Box><FormTextField name="payrollNumber" control={control} label="Employee/MAN Number" /></Box>
          </Box>
        </Section>
        <Section title="Next of Kin" toggle open={openKin} onToggle={()=>setOpenKin(o=>!o)} subtitle="Emergency contact details">
          <Box sx={{ display:'grid', gap:2, gridTemplateColumns:{ xs:'1fr', sm:'1fr 1fr' } }}>
            <Box><FormTextField name="nextOfKin.firstName" control={control} label="First Name" /></Box>
            <Box><FormTextField name="nextOfKin.lastName" control={control} label="Last Name" /></Box>
            <Box><FormTextField name="nextOfKin.phone" control={control} label="Phone Number" /></Box>
            <Box><FormTextField name="nextOfKin.email" control={control} label="Email" /></Box>
            <Box sx={{ gridColumn:'1 / -1' }}><FormTextField name="nextOfKin.address" control={control} label="Address" /></Box>
            <Box><FormNRCField name="nextOfKin.nrc" control={control} label="NRC" /></Box>
            <Box><FormTextField name="nextOfKin.nationality" control={control} label="Nationality" /></Box>
            <Box><FormTextField name="nextOfKin.relationship" control={control} label="Relationship" /></Box>
          </Box>
        </Section>
        <Section title="Reference" toggle open={openRef} onToggle={()=>setOpenRef(o=>!o)} subtitle="Professional or character reference">
          <Box sx={{ display:'grid', gap:2, gridTemplateColumns:{ xs:'1fr', sm:'1fr 1fr' } }}>
            <Box><FormTextField name="reference.name" control={control} label="Name" /></Box>
            <Box><FormTextField name="reference.phone" control={control} label="Phone" /></Box>
            <Box><FormTextField name="reference.email" control={control} label="Email" /></Box>
            <Box sx={{ gridColumn:'1 / -1' }}><FormTextField name="reference.address" control={control} label="Address" /></Box>
          </Box>
        </Section>
      </Stack>
      <Typography variant="caption" sx={{ mt:2, display:'block', color:'text.secondary' }}>Only required fields will be validated; others are optional for now.</Typography>
    </Box>
  );
};
