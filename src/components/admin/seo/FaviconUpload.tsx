import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";

export const FaviconUpload = () => {
  const form = useFormContext();

  const handleFaviconUpload = (url: string) => {
    form.setValue("favicon_url", url);
  };

  return (
    <FormField
      control={form.control}
      name="favicon_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Favicon</FormLabel>
          <FormControl>
            <ImageUpload
              name="favicon"
              currentImage={field.value}
              onUrlChange={handleFaviconUpload}
              accept="image/x-icon,image/png,image/ico"
              bucket="oni-media"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};