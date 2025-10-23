import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }
  const dbPath = path.resolve(__dirname, "imoveis.db");
  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS imoveis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_externo TEXT NOT NULL,
            endereco TEXT NOT NULL,
            bairro TEXT NOT NULL,
            valor_total REAL NOT NULL,
            data_coleta TEXT NOT NULL,
            disponivel BOOLEAN NOT NULL,
            site TEXT NOT NULL,
            link TEXT NOT NULL UNIQUE,
            qtd_quartos INTEGER NOT NULL,
            metragem REAL NOT NULL
        )
    `);
  console.log("SQLite conectado", dbPath);
  return dbInstance;
}
