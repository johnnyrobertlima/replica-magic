import { supabase } from "@/integrations/supabase/client";

export const handleServiceMutation = async (formData: FormData, id?: string) => {
  const coverImage = formData.get("cover_image") as File;
  let coverImageUrl = null;

  if (coverImage && coverImage instanceof File && coverImage.size > 0) {
    const fileExt = coverImage.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `services/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("oni-media")
      .upload(filePath, coverImage);

    if (uploadError) throw uploadError;
    coverImageUrl = filePath;
  }

  const serviceData = {
    title: String(formData.get("title")),
    description: String(formData.get("description")),
    detailed_description: formData.get("detailed_description") 
      ? String(formData.get("detailed_description")) 
      : null,
    icon: String(formData.get("icon")),
    sub_services: JSON.parse(String(formData.get("sub_services") || "[]")),
    ...(coverImageUrl && { cover_image_url: coverImageUrl }),
  };

  if (id) {
    const { error } = await supabase
      .from("services")
      .update(serviceData)
      .eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("services").insert([serviceData]);
    if (error) throw error;
  }
};