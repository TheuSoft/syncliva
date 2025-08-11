// Definição dos tipos de retorno para a action de upsert-patient
export type UpsertPatientActionResult = 
  | { success: true }
  | { error: string };
