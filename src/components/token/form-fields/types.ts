export interface FormFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export type FormField = React.FC<FormFieldProps>;