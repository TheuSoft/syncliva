import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DoctorReportsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Relatórios de Consulta</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie seus relatórios de consultas realizadas
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Relatórios de Consulta</CardTitle>
            <CardDescription>
              Aqui você pode visualizar e gerar relatórios das suas consultas
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
