import { Stethoscope } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface TopDoctorsProps {
  doctors: {
    id: string;
    name: string;
    avatarImageUrl: string | null;
    specialty: string;
    appointments: number;
  }[];
}

export default function TopDoctors({ doctors }: TopDoctorsProps) {
  return (
    <Card className="from-background to-muted/20 border-border/40 border bg-gradient-to-br shadow-sm transition-all duration-300 hover:shadow-md">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-primary/10 border-primary/20 rounded-lg border p-2">
            <Stethoscope className="text-primary h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Top Médicos</CardTitle>
            <p className="text-muted-foreground text-sm">
              Médicos com mais agendamentos
            </p>
          </div>
        </div>

        {/* Doctors List */}
        <div className="space-y-4">
          {doctors.map((doctor, index) => (
            <div
              key={doctor.id}
              className="bg-muted/30 border-border/30 hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="border-background h-10 w-10 border-2 shadow-sm">
                    <AvatarFallback className="from-primary/20 to-primary/10 text-primary bg-gradient-to-br text-sm font-semibold">
                      {doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <div className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium">
                    {doctor.name}
                  </h3>
                  <p className="text-muted-foreground truncate text-xs">
                    {doctor.specialty}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-primary text-sm font-semibold">
                  {doctor.appointments}
                </span>
                <p className="text-muted-foreground text-xs">agend.</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
