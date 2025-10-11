import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, Control } from 'react-hook-form';

interface FormNRCFieldProps extends Omit<TextFieldProps, 'name' | 'onChange' | 'value'> {
  name: string;
  control: Control<any>;
}

const formatNRC = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Limit to 9 digits maximum
  const limitedDigits = digits.substring(0, 9);
  
  // Format with slashes: XXXXXX/XX/X
  if (limitedDigits.length <= 6) {
    return limitedDigits;
  } else if (limitedDigits.length <= 8) {
    return `${limitedDigits.substring(0, 6)}/${limitedDigits.substring(6)}`;
  } else {
    return `${limitedDigits.substring(0, 6)}/${limitedDigits.substring(6, 8)}/${limitedDigits.substring(8)}`;
  }
};

const parseNRC = (formattedValue: string): string => {
  // Return the formatted value for form storage (keep the slashes)
  return formattedValue;
};

export const FormNRCField: React.FC<FormNRCFieldProps> = ({ name, control, ...rest }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...rest}
          fullWidth
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          value={formatNRC(field.value || '')}
          onChange={(e) => {
            const formatted = formatNRC(e.target.value);
            const parsed = parseNRC(formatted);
            field.onChange(parsed);
          }}
          placeholder="XXXXXX/XX/X"
          inputProps={{
            maxLength: 11, // 6 digits + 2 slashes + 2 digits + 1 slash + 1 digit
          }}
        />
      )}
    />
  );
};