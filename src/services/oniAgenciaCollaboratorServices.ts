
import { supabase } from "@/integrations/supabase/client";
import { OniAgenciaCollaborator, CollaboratorFormData } from "@/types/oni-agencia";

const ONI_AGENCIA_COLLABORATORS_TABLE = 'oni_agencia_collaborators';

export async function getCollaborators(): Promise<OniAgenciaCollaborator[]> {
  const { data, error } = await supabase
    .from(ONI_AGENCIA_COLLABORATORS_TABLE)
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching collaborators:', error);
    throw error;
  }

  return data || [];
}

export async function createCollaborator(collaborator: CollaboratorFormData): Promise<OniAgenciaCollaborator> {
  try {
    const { data, error } = await supabase
      .from(ONI_AGENCIA_COLLABORATORS_TABLE)
      .insert(collaborator)
      .select()
      .single();

    if (error) {
      console.error('Error creating collaborator:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating collaborator:', error);
    throw error;
  }
}

export async function updateCollaborator(id: string, collaborator: CollaboratorFormData): Promise<OniAgenciaCollaborator> {
  try {
    const { data, error } = await supabase
      .from(ONI_AGENCIA_COLLABORATORS_TABLE)
      .update(collaborator)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating collaborator:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating collaborator:', error);
    throw error;
  }
}

export async function deleteCollaborator(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(ONI_AGENCIA_COLLABORATORS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting collaborator:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting collaborator:', error);
    throw error;
  }
}
