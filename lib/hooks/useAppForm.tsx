import { useForm, DefaultValues } from 'react-hook-form';
// Types
import { FormValues } from '../form'

export default function useAppForm(defaultValues?: DefaultValues<FormValues>) {
  return useForm<FormValues>({ defaultValues });
}