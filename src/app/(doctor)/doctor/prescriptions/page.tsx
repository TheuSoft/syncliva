import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DoctorPrescriptionsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerar Receita Médica</h1>
        <p className="text-muted-foreground">
          Crie e gerencie receitas médicas para seus pacientes
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova Receita Médica</CardTitle>
            <CardDescription>
              Preencha os dados para gerar uma nova receita médica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
