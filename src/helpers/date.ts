/**
 * Helper para lidar com datas de agendamentos que podem estar em UTC
 * e precisam ser convertidas para horário local brasileiro
 */

// ✅ Função helper para converter UTC para horário local brasileiro
export const convertToLocalDate = (utcDate: Date | string): Date => {
  const date = new Date(utcDate);
  // Criar nova data em horário local (sem ajuste de timezone)
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
};

// ✅ Função para verificar se uma data precisa de conversão
export const needsTimezoneConversion = (date: Date | string): boolean => {
  const dateObj = new Date(date);
  // Se a data está em formato UTC (termina com Z ou tem offset)
  return dateObj.toISOString() !== dateObj.toString();
};
