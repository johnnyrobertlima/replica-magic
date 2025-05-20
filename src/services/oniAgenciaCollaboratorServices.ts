import { supabase } from "@/integrations/supabase/client";
import { OniAgenciaCollaborator, CollaboratorFormData } from "@/types/oni-agencia";

const ONI_AGENCIA_COLLABORATORS_TABLE = 'oni_agencia_collaborators';

export async function getCollaborators(): Promise<OniAgenciaCollaborator[]> {
  try {
    console.log("Fetching collaborators from table:", ONI_AGENCIA_COLLABORATORS_TABLE);
    const { data, error } = await supabase
      .from(ONI_AGENCIA_COLLABORATORS_TABLE)
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching collaborators:', error);
      throw error;
    }

    // Safety check: ensure we always return an array, even if data is null or undefined
    const collaborators = Array.isArray(data) ? data : [];
    
    // Additional validation to ensure all items are valid
    const validCollaborators = collaborators.filter(
      c => c && typeof c === 'object' && c.id && c.name
    );
    
    console.log(`Successfully fetched ${validCollaborators.length} valid collaborators from database`);
    return validCollaborators;
  } catch (error) {
    console.error('Exception while fetching collaborators:', error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
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
