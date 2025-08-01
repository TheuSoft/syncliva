declare module "better-auth/types" {
  interface User {
    role: "clinic_admin" | "doctor";
    doctorId?: string;
    clinic?: {
      id: string;
      name: string;
    };
  }
}
