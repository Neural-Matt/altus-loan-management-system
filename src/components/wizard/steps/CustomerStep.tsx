import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, CustomerFormValues } from '../../../validation/schemas';
import { Box, Typography, Paper, Collapse, IconButton, Stack, MenuItem, Autocomplete, TextField, Chip, Tooltip } from '@mui/material';
import { FormTextField } from '../../form/FormTextField';
import { FormNRCField } from '../../form/FormNRCField';
import { useWizardData } from '../WizardDataContext';
import { useAltus } from '../../../context/AltusContext';
import { useSnackbar } from '../../feedback/SnackbarProvider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getBranchesForBank, getBranchGroup, allValidBranches } from '../../../constants/bankBranches';
import { provinces, citiesByProvince, branchByProvince, getCitiesForProvince, getBranchesForProvince } from '../../../constants/locationConstants';
import { RELATIONSHIP_ID_MAP, BANK_ID_MAP } from '../../../constants/altusLookups';

export const CustomerStep: React.FC = () => {
  const { customer, setCustomer } = useWizardData();
  const { createRetailCustomer } = useAltus();
  const { push } = useSnackbar();
  const [openKin, setOpenKin] = React.useState(true);
  const [openRef, setOpenRef] = React.useState(false);

  // Helper function to get human-readable bank names for display
  const getBankDisplayNames = (): string[] => {
    return Object.values(BANK_ID_MAP);
  };

  // Helper function to convert bank display name to ALTUS ID
  const getBankIdFromName = (bankName: string): string => {
    const entry = Object.entries(BANK_ID_MAP).find(([id, name]) => name === bankName);
    return entry ? entry[0] : '';
  };

  // Helper function to convert ALTUS ID to bank display name
  const getBankNameFromId = (bankId: string): string => {
    return BANK_ID_MAP[bankId] || '';
  };

  const { control, handleSubmit, reset, watch, formState: { errors }, trigger } = useForm<CustomerFormValues>({
    defaultValues: {
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      nrc: customer.nrc || '',
      nrcIssueDate: customer.nrcIssueDate || '',
      dateOfBirth: customer.dateOfBirth || '',
      title: customer.title || '',
      city: customer.city || '',
      province: customer.province || '',
      postalCode: customer.postalCode || '',
      purpose: customer.purpose || '',
      gender: customer.gender || '',
      nationality: customer.nationality || '',
      otherNationality: customer.otherNationality || '',
      occupation: customer.occupation || '',
      maritalStatus: customer.maritalStatus || '',
      accommodationType: customer.accommodationType || '',
      employerName: customer.employerName || '',
      employerId: customer.employerId || '',
      payrollNumber: customer.payrollNumber || '',
      salary: customer.salary || 0,
      employmentDate: customer.employmentDate || '',
      employmentType: customer.employmentType || '',
      bankName: customer.bankName || '',
      bankBranch: customer.bankBranch || '',
      accountNumber: customer.accountNumber || '',
      accountType: customer.accountType || '',
      nextOfKin: customer.nextOfKin || {},
      reference: customer.reference || {}
    },
    resolver: zodResolver(customerSchema) as any,
    mode: 'onBlur'
  });

  // Watch nationality field to conditionally show other nationality input
  const nationalityValue = watch('nationality');
  
  // Watch bank name to filter branch options dynamically
  const selectedBankName = watch('bankName');
  
  // Watch province to filter city and branch options (cascading)
  const selectedProvince = watch('province');
  
  // Watch next of kin province for cascading dropdowns
  const selectedKinProvince = watch('nextOfKin.province');

  useEffect(() => {
    reset({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      nrc: customer.nrc || '',
      nrcIssueDate: customer.nrcIssueDate || '',
      dateOfBirth: customer.dateOfBirth || '',
      title: customer.title || '',
      city: customer.city || '',
      province: customer.province || '',
      postalCode: customer.postalCode || '',
      purpose: customer.purpose || '',
      gender: customer.gender || '',
      nationality: customer.nationality || '',
      otherNationality: customer.otherNationality || '',
      occupation: customer.occupation || '',
      maritalStatus: customer.maritalStatus || '',
      accommodationType: customer.accommodationType || '',
      employerName: customer.employerName || '',
      employerId: customer.employerId || '',
      payrollNumber: customer.payrollNumber || '',
      salary: customer.salary || 0,
      employmentDate: customer.employmentDate || '',
      employmentType: customer.employmentType || '',
      bankName: customer.bankName || '',
      bankBranch: customer.bankBranch || '',
      accountNumber: customer.accountNumber || '',
      accountType: customer.accountType || '',
      nextOfKin: customer.nextOfKin || {},
      reference: customer.reference || {}
    });
  }, [customer, reset]);

  const onValid = async (values: CustomerFormValues) => { 
    try {
      // Update wizard data first
      setCustomer(values);
      
      // Validate all required fields before creating request
      if (!values.address || !values.city || !values.province) {
        push('Please fill in all address fields (Address, City, Province)', 'error');
        return;
      }
      
      if (!values.bankName || !values.accountNumber || !values.accountType || !values.bankBranch) {
        push('Please fill in all bank details', 'error');
        return;
      }
      
      if (!values.employerName || !values.salary || !values.employmentDate || !values.employmentType) {
        push('Please fill in all employment details', 'error');
        return;
      }
      
      // Transform wizard data to Altus API format
      const customerRequest = {
        firstName: values.firstName,
        lastName: values.lastName || values.firstName, // Use firstName if lastName is empty (API accepts empty LastName)
        nrc: values.nrc,
        nrcIssueDate: values.nrcIssueDate,
        phoneNumber: values.phone,
        emailAddress: values.email,
        dateOfBirth: values.dateOfBirth,
        title: values.title,
        gender: values.gender as "Male" | "Female",
        nationality: values.nationality === 'Other' ? values.otherNationality || '' : values.nationality || 'Zambian',
        otherNationality: values.nationality === 'Other' ? values.otherNationality : undefined,
        maritalStatus: values.maritalStatus,
        address: {
          street: values.address,
          city: values.city,
          province: values.province,
          postalCode: values.postalCode || "",
          country: "Zambia"
        },
        preferredBranch: values.preferredBranch,
        employment: {
          employerId: values.employerId || "EMP001",
          employerName: values.employerName,
          employerCode: values.payrollNumber || '',
          position: values.occupation || 'Employee',
          salary: values.salary,
          employmentDate: values.employmentDate,
          employmentType: (values.employmentType || "Permanent") as "Permanent" | "Contract" | "Temporary"
        },
        nextOfKin: {
          firstName: values.nextOfKin?.firstName || '',
          lastName: values.nextOfKin?.lastName || '',
          relationship: values.nextOfKin?.relationship || '',
          phoneNumber: values.nextOfKin?.phone || '',
          address: values.nextOfKin?.address
        },
        bankDetails: {
          bankName: getBankIdFromName(values.bankName) || values.bankName, // Convert to ALTUS ID
          accountNumber: values.accountNumber,
          accountType: values.accountType,
          branchCode: values.bankBranch
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
  
  // Validator function that triggers form validation and shows missing fields
  (window as any).__customerStepSubmit = async () => {
    const isValid = await trigger(); // Trigger validation on all fields
    if (!isValid) {
      const missingFields: string[] = [];
      Object.keys(errors).forEach(key => {
        const errorKey = key as keyof typeof errors;
        if (errors[errorKey]?.message) {
          missingFields.push(errors[errorKey]?.message as string);
        }
      });
      
      if (missingFields.length > 0) {
        push(`⚠️ Please complete all required fields: ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? '...' : ''}`, 'error');
      } else {
        push('Please fill in all required customer information before proceeding', 'error');
      }
      return false;
    }
    
    // Update customer data without creating customer (fast track mode)
    const values = watch();
    setCustomer(values);
    return true;
  };

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
            <Box>
              <FormTextField 
                name="title" 
                control={control} 
                label="Title"
                select
              >
                <MenuItem value="Mr">Mr.</MenuItem>
                <MenuItem value="Mrs">Mrs.</MenuItem>
                <MenuItem value="Miss">Miss.</MenuItem>
                <MenuItem value="Ms">Ms.</MenuItem>
                <MenuItem value="Dr">Dr.</MenuItem>
              </FormTextField>
            </Box>
            <Box></Box>
            <Box><FormTextField name="firstName" control={control} label="First Name" /></Box>
            <Box><FormTextField name="lastName" control={control} label="Last Name" /></Box>
            <Box><FormTextField name="phone" control={control} label="Phone Number" /></Box>
            <Box><FormTextField name="email" control={control} label="Email" /></Box>
            <Box><FormTextField name="dateOfBirth" control={control} label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} /></Box>
            <Box><FormNRCField name="nrc" control={control} label="NRC" /></Box>
            <Box><FormTextField name="nrcIssueDate" control={control} label="NRC Issue Date" type="date" InputLabelProps={{ shrink: true }} /></Box>
            <Box>
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
            <Box sx={{ gridColumn:'1 / -1' }}><FormTextField name="address" control={control} label="Residential Address" /></Box>
            
            {/* Province Autocomplete - First in cascade */}
            <Box>
              <Controller
                name="province"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    options={[...provinces]}
                    value={field.value || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue || '');
                      // Reset dependent fields when province changes
                      const currentValues = watch();
                      if (newValue !== field.value) {
                        reset({ ...currentValues, city: '', bankBranch: '' });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Province"
                        error={!!error}
                        helperText={error?.message}
                        required
                      />
                    )}
                    disableClearable={false}
                    isOptionEqualToValue={(option, value) => option === value}
                  />
                )}
              />
            </Box>

            {/* City Autocomplete - Filtered by province */}
            <Box>
              <Controller
                name="city"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    options={selectedProvince ? getCitiesForProvince(selectedProvince) : []}
                    value={field.value || null}
                    onChange={(_, newValue) => field.onChange(newValue || '')}
                    disabled={!selectedProvince}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="City/District"
                        error={!!error}
                        helperText={error?.message || (!selectedProvince ? 'Select province first' : '')}
                        required
                      />
                    )}
                    disableClearable={false}
                    isOptionEqualToValue={(option, value) => option === value}
                  />
                )}
              />
            </Box>
            
            <Box><FormTextField name="postalCode" control={control} label="Postal Code (Optional)" /></Box>
            <Box>
              <FormTextField 
                name="preferredBranch" 
                control={control} 
                label="Nearest Branch"
                select
                helperText="Select your nearest Altus branch location"
              >
                <MenuItem value="Lusaka - HQ">Lusaka - HQ</MenuItem>
                <MenuItem value="Kitwe">Kitwe</MenuItem>
                <MenuItem value="Livingstone">Livingstone</MenuItem>
                <MenuItem value="Kasama">Kasama</MenuItem>
                <MenuItem value="Solwezi">Solwezi</MenuItem>
                <MenuItem value="Ndola">Ndola</MenuItem>
                <MenuItem value="Mansa">Mansa</MenuItem>
                <MenuItem value="Mongu">Mongu</MenuItem>
                <MenuItem value="Choma">Choma</MenuItem>
                <MenuItem value="Chipata">Chipata</MenuItem>
                <MenuItem value="Lusaka CBD">Lusaka CBD</MenuItem>
                <MenuItem value="Kabwe">Kabwe</MenuItem>
              </FormTextField>
            </Box>
            <Box>
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
          </Box>
        </Section>
        <Section title="Employment Details" subtitle="Work and income information">
          <Box sx={{ display:'grid', gap:2, gridTemplateColumns:{ xs:'1fr', sm:'1fr 1fr' } }}>
            <Box><FormTextField name="employerName" control={control} label="Employer Name" /></Box>
            <Box><FormTextField name="payrollNumber" control={control} label="Employee/Payroll Number" /></Box>
            <Box><FormTextField name="employerId" control={control} label="Employer ID (Optional)" /></Box>
            <Box><FormTextField name="occupation" control={control} label="Job Title/Position" /></Box>
            <Box><FormTextField name="salary" control={control} label="Monthly Salary (ZMW)" type="number" /></Box>
            <Box><FormTextField name="employmentDate" control={control} label="Employment Start Date" type="date" InputLabelProps={{ shrink: true }} /></Box>
            <Box>
              <FormTextField 
                name="employmentType" 
                control={control} 
                label="Employment Type"
                select
              >
                <MenuItem value="Permanent">Permanent</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Temporary">Temporary</MenuItem>
              </FormTextField>
            </Box>
          </Box>
        </Section>
        <Section title="Bank Details" subtitle="Account information for disbursement">
          <Box sx={{ display:'grid', gap:2, gridTemplateColumns:{ xs:'1fr', sm:'1fr 1fr' } }}>
            {/* Bank Name - Autocomplete with all Zambian banks */}
            <Box>
              <Controller
                name="bankName"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    options={getBankDisplayNames()}
                    value={field.value || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue || '');
                      // Reset branch when bank changes
                      if (newValue !== field.value) {
                        const currentBranch = watch('bankBranch');
                        const bankId = getBankIdFromName(newValue || '');
                        const newBranches = bankId ? getBranchesForBank(bankId) : allValidBranches;
                        if (!newBranches.includes(currentBranch as any)) {
                          // Clear branch if it's not valid for the new bank
                          reset({ ...watch(), bankBranch: '' });
                        }
                      }
                    }}
                    disableClearable={false}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Bank Name"
                        error={!!error}
                        helperText={error?.message || 'Select your bank'}
                        required
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option === value}
                  />
                )}
              />
            </Box>
            
            {/* FNB warning removed as requested */}
            
            {/* Bank Branch - Autocomplete filtered by province */}
            <Box>
              <Controller
                name="bankBranch"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  // Filter branches by province first, then by bank if needed
                  const provinceFilteredBranches = selectedProvince 
                    ? getBranchesForProvince(selectedProvince)
                    : allValidBranches;
                  
                  // Filter branches by province
                  const availableBranches = provinceFilteredBranches;
                  
                  return (
                    <Autocomplete
                      {...field}
                      options={[...availableBranches]}
                      value={field.value || null}
                      onChange={(_, newValue) => field.onChange(newValue || '')}
                      groupBy={(option) => getBranchGroup(option) || 'Other'}
                      filterOptions={(options, { inputValue }) => {
                        if (!inputValue) return options;
                        const query = inputValue.toLowerCase();
                        return options.filter(option => 
                          option.toLowerCase().includes(query)
                        );
                      }}
                      disableClearable={false}
                      disabled={!selectedBankName || !selectedProvince}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Bank Branch"
                          error={!!error}
                          helperText={
                            error?.message || 
                            (!selectedBankName 
                              ? 'Select a bank first' 
                              : !selectedProvince 
                                ? 'Select a province first'
                                : `${availableBranches.length} branches available in ${selectedProvince}`)
                          }
                          required
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {params.InputProps.endAdornment}
                                <Tooltip 
                                  title={
                                    <Box>
                                      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                                        ⚠️ IMPORTANT: Exact Branch Match Required
                                      </Typography>
                                      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                                        Branches are filtered by your selected province. Select the exact branch name.
                                      </Typography>
                                      <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic' }}>
                                        Type to search branches by name
                                      </Typography>
                                    </Box>
                                  }
                                  arrow
                                  placement="top"
                                >
                                  <InfoOutlinedIcon 
                                    sx={{ 
                                      fontSize: 20, 
                                      color: 'action.active',
                                      cursor: 'help',
                                      mr: 0.5
                                    }} 
                                  />
                                </Tooltip>
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} key={option}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <Typography variant="body2">{option}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getBranchGroup(option)}
                            </Typography>
                          </Box>
                        </li>
                      )}
                      isOptionEqualToValue={(option, value) => option === value}
                    />
                  );
                }}
              />
            </Box>
            
            <Box><FormTextField name="accountNumber" control={control} label="Account Number" /></Box>
            <Box>
              <FormTextField 
                name="accountType" 
                control={control} 
                label="Account Type"
                select
              >
                <MenuItem value="Savings">Savings</MenuItem>
                <MenuItem value="Current">Current</MenuItem>
                <MenuItem value="Fixed Deposit">Fixed Deposit</MenuItem>
              </FormTextField>
            </Box>
          </Box>
          
          {/* Visual indicator for branch validation */}
          {selectedBankName && watch('bankBranch') && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="Exact match required" 
                size="small" 
                color="error" 
                variant="outlined"
                icon={<InfoOutlinedIcon />}
              />
              <Typography variant="caption" color="text.secondary">
                Selected: <strong>{watch('bankBranch')}</strong>
              </Typography>
            </Box>
          )}
        </Section>
        <Section title="Next of Kin" toggle open={openKin} onToggle={()=>setOpenKin(o=>!o)} subtitle="Emergency contact details">
          <Box sx={{ display:'grid', gap:2, gridTemplateColumns:{ xs:'1fr', sm:'1fr 1fr' } }}>
            <Box><FormTextField name="nextOfKin.firstName" control={control} label="First Name" /></Box>
            <Box><FormTextField name="nextOfKin.lastName" control={control} label="Last Name" /></Box>
            <Box><FormTextField name="nextOfKin.phone" control={control} label="Phone Number" /></Box>
            <Box><FormTextField name="nextOfKin.email" control={control} label="Email" /></Box>
            <Box sx={{ gridColumn:'1 / -1' }}><FormTextField name="nextOfKin.address" control={control} label="Address" /></Box>
            
            {/* Next of Kin Province Autocomplete */}
            <Box>
              <Controller
                name="nextOfKin.province"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    options={[...provinces]}
                    value={field.value || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue || '');
                      // Reset city when province changes
                      const currentValues = watch();
                      if (newValue !== field.value) {
                        reset({ 
                          ...currentValues, 
                          nextOfKin: { 
                            ...currentValues.nextOfKin, 
                            city: '' 
                          } 
                        });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Province"
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                    disableClearable={false}
                    isOptionEqualToValue={(option, value) => option === value}
                  />
                )}
              />
            </Box>

            {/* Next of Kin City Autocomplete */}
            <Box>
              <Controller
                name="nextOfKin.city"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    options={selectedKinProvince ? getCitiesForProvince(selectedKinProvince) : []}
                    value={field.value || null}
                    onChange={(_, newValue) => field.onChange(newValue || '')}
                    disabled={!selectedKinProvince}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="City/District"
                        error={!!error}
                        helperText={error?.message || (!selectedKinProvince ? 'Select province first' : '')}
                      />
                    )}
                    disableClearable={false}
                    isOptionEqualToValue={(option, value) => option === value}
                  />
                )}
              />
            </Box>
            <Box><FormNRCField name="nextOfKin.nrc" control={control} label="NRC" /></Box>
            <Box><FormTextField name="nextOfKin.nationality" control={control} label="Nationality" /></Box>
            <Box>
              <Controller
                name="nextOfKin.relationship"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    select
                    label="Relationship"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  >
                    {Object.entries(RELATIONSHIP_ID_MAP).map(([name, id]) => (
                      <MenuItem key={id} value={name}>
                        {id} - {name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>
          </Box>
        </Section>
        <Section title="Reference" toggle open={openRef} onToggle={()=>setOpenRef(o=>!o)} subtitle="Professional or character reference">
          <Box sx={{ display:'grid', gap:2, gridTemplateColumns:{ xs:'1fr', sm:'1fr 1fr' } }}>
            <Box><FormTextField name="reference.name" control={control} label="Name" /></Box>
            <Box><FormTextField name="reference.phone" control={control} label="Phone" /></Box>
            <Box><FormTextField name="reference.email" control={control} label="Email" /></Box>
            <Box sx={{ gridColumn:'1 / -1' }}><FormTextField name="reference.address" control={control} label="Address" /></Box>
            <Box><FormNRCField name="reference.nrc" control={control} label="NRC" /></Box>
            <Box>
              <Controller
                name="reference.relationship"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    select
                    label="Relationship"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  >
                    {Object.entries(RELATIONSHIP_ID_MAP).map(([name, id]) => (
                      <MenuItem key={id} value={name}>
                        {id} - {name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>
          </Box>
        </Section>
      </Stack>
      <Typography variant="caption" sx={{ mt:2, display:'block', color:'text.secondary' }}>Only required fields will be validated; others are optional for now.</Typography>
    </Box>
  );
};
