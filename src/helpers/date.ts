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
  // Aplicar offset de -3 horas (Brasil)
  return new Date(utcDate.getTime() - 3 * 60 * 60 * 1000);
}

/**
 * Converte uma data local brasileira para UTC
 * @param localDate Data em hora local
 * @returns Data convertida para UTC
 */
export function convertToUTC(localDate: Date): Date {
  // Aplicar offset de +3 horas para UTC
  return new Date(localDate.getTime() + 3 * 60 * 60 * 1000);
}
