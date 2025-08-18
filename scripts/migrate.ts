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
  } catch (error) {
    console.error("Erro ao executar migrações:", error);
    process.exit(1);
  }
}

runMigrations();
