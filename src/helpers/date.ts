/**
 * 🕒 Helpers para conversão de timezone
 * Funções para converter entre UTC e hora local brasileira
 */

/**
 * Converte uma data UTC para hora local brasileira (UTC-3)
 * @param utcDate Data em UTC
 * @returns Data convertida para hora local
 */
export function convertToLocalDate(utcDate: Date): Date {
  // UTC-3: Para converter UTC para local, SUBTRAÍMOS 3 horas do UTC
  // Se UTC é 23:00, local é 20:00 (23 - 3 = 20)
  return new Date(utcDate.getTime() - 3 * 60 * 60 * 1000);
}

/**
 * Converte uma data local brasileira para UTC
 * @param localDate Data em hora local
 * @returns Data convertida para UTC
 */
export function convertToUTC(localDate: Date): Date {
  // UTC-3: Para converter local para UTC, ADICIONAMOS 3 horas ao local
  // Se local é 20:00, UTC é 23:00 (20 + 3 = 23)
  return new Date(localDate.getTime() + 3 * 60 * 60 * 1000);
}
