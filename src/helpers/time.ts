export const generateTimeSlots = () => {
  const slots = [];
  // ✅ CORREÇÃO: Gerar slots de 6h às 22h para horários mais realistas de consultório
  for (let hour = 6; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
      slots.push(timeString);
    }
  }
  return slots;
};
