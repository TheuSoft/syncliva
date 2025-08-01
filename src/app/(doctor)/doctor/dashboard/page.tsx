import { redirect } from "next/navigation";

export default function DoctorDashboard() {
  // Redirecionar para a página principal de pacientes marcados
  redirect("/doctor/appointments");
}
