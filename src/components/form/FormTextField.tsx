import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, Control } from 'react-hook-form';

interface FormTextFieldProps extends Omit<TextFieldProps, 'name'> {
  name: string;
  control: Control<any>;
}

export const FormTextField: React.FC<FormTextFieldProps> = ({ name, control, ...rest }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...rest}
          fullWidth
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
  );
};
