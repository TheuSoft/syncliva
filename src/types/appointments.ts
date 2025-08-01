export type AppointmentStatus = "pending" | "confirmed" | "canceled";

export type AppointmentWithRelations = {
  id: string;
  date: Date;
  appointmentPriceInCents: number;
  clinicId: string;
  patientId: string;
  doctorId: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    sex: "male" | "female";
  };
  doctor: {
    id: string;
    name: string;
    specialty: string;
    appointmentPriceInCents: number;
  };
};

export type ActionResult = {
  success: boolean;
  message: string;
};
