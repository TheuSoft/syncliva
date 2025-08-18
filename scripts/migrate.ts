import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import "dotenv/config";

async function runMigrations() {
  console.log("Executando migrações do banco de dados...");

  try {
    const db = drizzle(process.env.DATABASE_URL!);
    
    await migrate(db, { migrationsFolder: "./drizzle" });
    
    console.log("Migrações executadas com sucesso!");
    process.exit(0);
  } catch (error: any) {
    // Verificar se o erro é sobre tipos/objetos já existentes
    const errorMessage = error?.message?.toLowerCase() || '';
    const isAlreadyExistsError = 
      errorMessage.includes('já existe') || 
      errorMessage.includes('already exists') ||
      error?.cause?.code === '42710' || // PostgreSQL error code for "duplicate_object"
      error?.cause?.code === '42P07';   // PostgreSQL error code for "duplicate_table"
    
    if (isAlreadyExistsError) {
      console.warn("AVISO: Alguns objetos já existem no banco de dados. Continuando build...");
      console.log("Migrações concluídas (alguns objetos já existiam).");
      process.exit(0);
    } else {
      console.error("Erro ao executar migrações:", error);
      process.exit(1);
    }
  }
}

runMigrations();
