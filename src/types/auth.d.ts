declare module "better-auth/types" {
  interface User {
    role: "admin" | "receptionist" | "doctor";
    doctorId?: string;
    receptionistId?: string;
    clinic?: {
      id: string;
      name: string;
    };
  }
}
