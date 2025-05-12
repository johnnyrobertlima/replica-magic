
import { Form } from "@/components/ui/form";
import { useNovoClienteForm } from "./useNovoClienteForm";
import { FormFields } from "./FormFields";
import { SuccessMessage } from "./SuccessMessage";

export const NovoClienteForm = () => {
  const { form, isSubmitting, submitted, onSubmit, resetForm } = useNovoClienteForm();

  if (submitted) {
    return <SuccessMessage onReset={resetForm} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormFields isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
};
