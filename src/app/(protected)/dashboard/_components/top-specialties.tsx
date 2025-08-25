import {
  Activity,
  Baby,
  Bone,
  Brain,
  Eye,
  Hand,
  Heart,
  Hospital,
  Stethoscope,
} from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TopSpecialtiesProps {
  topSpecialties: {
    specialty: string;
    appointments: number;
  }[];
}

const getSpecialtyIcon = (specialty: string) => {
  const specialtyLower = specialty.toLowerCase();

  if (specialtyLower.includes("cardiolog")) return Heart;
  if (
    specialtyLower.includes("ginecolog") ||
    specialtyLower.includes("obstetri")
  )
    return Baby;
  if (specialtyLower.includes("pediatr")) return Activity;
  if (specialtyLower.includes("dermatolog")) return Hand;
  if (
    specialtyLower.includes("ortoped") ||
    specialtyLower.includes("traumatolog")
  )
    return Bone;
  if (specialtyLower.includes("oftalmolog")) return Eye;
  if (specialtyLower.includes("neurolog")) return Brain;

  return Stethoscope;
};

export default function TopSpecialties({
  topSpecialties,
}: TopSpecialtiesProps) {
  const maxAppointments = Math.max(
    ...topSpecialties.map((i) => i.appointments),
  );
  return (
    <Card className="from-background to-muted/20 border-border/40 border bg-gradient-to-br shadow-sm transition-all duration-300 hover:shadow-md">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-primary/10 border-primary/20 rounded-lg border p-2">
            <Hospital className="text-primary h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">
              Top Especialidades
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Especialidades mais procuradas
            </p>
          </div>
        </div>

        {/* specialties List */}
        <div className="space-y-4">
          {topSpecialties.map((specialty) => {
            const Icon = getSpecialtyIcon(specialty.specialty);
            // Porcentagem de ocupação da especialidade baseando-se no maior número de agendamentos
            const progressValue =
              (specialty.appointments / maxAppointments) * 100;

            return (
              <div
                key={specialty.specialty}
                className="bg-muted/30 border-border/30 hover:bg-muted/50 rounded-lg border p-3 transition-colors"
              >
                <div className="mb-2 flex items-center gap-3">
                  <div className="bg-primary/10 border-primary/20 flex h-8 w-8 items-center justify-center rounded-lg border">
                    <Icon className="text-primary h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate text-sm font-medium">
                        {specialty.specialty}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-primary text-sm font-semibold">
                          {specialty.appointments}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          agend.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Progress value={progressValue} className="h-2 w-full" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
