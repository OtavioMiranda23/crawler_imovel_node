import { Database } from "sqlite";
import { getDatabase } from "../sqlite/connection";
import ImovelEntity from "../../../domain/entities/imovelEntity";

export default class ImovelRepository {
  private db: Promise<Database>;

  constructor() {
    this.db = getDatabase();
  }
  public async save(imovel: ImovelEntity): Promise<number | undefined> {
    const db = await this.db;
    try {
      const result = await db.run(
        `INSERT INTO imoveis (
          idExterno, 
          endereco, 
          bairro, 
          valorTotal, 
          dataColeta, 
          disponivel, 
          site, 
          link, 
          qtd_quartos, 
          metragem
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          imovel.idExterno,
          imovel.endereco,
          imovel.bairro,
          imovel.valorTotal,
          imovel.dataColeta,
          imovel.disponivel ? 1 : 0,
          imovel.site,
          imovel.link,
          imovel.qtdQuartos,
          imovel.metragem,
        ]
      );
      return result.lastID;
    } catch (error) {
      console.error("Erro ao salvar imóvel:", error);
      throw new Error("Falha ao salvar imóvel");
    } finally {
      db.close();
    }
  }

  public async getAll(): Promise<ImovelEntity[]> {
    const db = await this.db;
    try {
      const rows = await db.all("SELECT * FROM imoveis");
      if (!rows.length) {
        return [];
      }
      return rows.map((row) =>
        ImovelEntity.create({
          endereco: row.endereco,
          valorTotalRaw: row.valorTotal.toString(),
          disponivel: row.disponivel === 1,
          site: row.site,
          link: row.link,
          qtdQuartos: row.qtdQuartos,
          metragemRaw: row.metragem,
        })
      );
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
      throw new Error("Falha ao buscar imóveis");
    } finally {
      db.close();
    }
  }

  public async getById(id: number): Promise<ImovelEntity | null> {
    const db = await this.db;
    try {
      const row = await db.get("SELECT * FROM imoveis WHERE id = ?", [id]);
      if (!row) {
        return null;
      }
      return ImovelEntity.create({
        endereco: row.endereco,
        valorTotalRaw: row.valorTotal.toString(),
        disponivel: row.disponivel === 1,
        site: row.site,
        link: row.link,
        qtdQuartos: row.qtdQuartos,
        metragemRaw: row.metragem,
      });
    } catch (error) {
      console.error("Erro ao buscar imóvel:", error);
      throw new Error("Falha ao buscar imóvel");
    } finally {
      db.close();
    }
  }

  public async getByIdExterno(idExterno: string): Promise<ImovelEntity | null> {
    const db = await this.db;
    try {
      const row = await db.get("SELECT * FROM imoveis WHERE id_externo = ?", [
        idExterno,
      ]);
      if (!row) {
        return null;
      }
      return ImovelEntity.create({
        endereco: row.endereco,
        valorTotalRaw: row.valorTotal.toString(),
        disponivel: row.disponivel === 1,
        site: row.site,
        link: row.link,
        qtdQuartos: row.qtdQuartos,
        metragemRaw: row.metragem,
      });
    } catch (error) {
      console.error("Erro ao buscar imóvel:", error);
      throw new Error("Falha ao buscar imóvel");
    } finally {
      db.close();
    }
  }

  public async deleteByIdExterno(idExterno: string): Promise<void> {
    const db = await this.db;
    try {
      const result = await db.run("DELETE FROM imoveis WHERE id_externo = ?", [
        idExterno,
      ]);
      const deletedId = result.lastID;
      if (deletedId === 0) {
        throw new Error(
          `Imóvel com id_externo ${idExterno} não encontrado para exclusão`
        );
      }
    } catch (error) {
      console.error("Erro ao excluir imóvel:", error);
      throw new Error("Falha ao excluir imóvel");
    } finally {
      db.close();
    }
  }

  /**
   * Atualiza dinamicamente apenas os campos fornecidos
   * @param id - ID do imóvel a ser atualizado
   * @param updates - Objeto com os campos a serem atualizados
   * @returns Promise<void>
   *
   * @example
   * // Atualizar apenas o valor
   * await repository.update("123", { valorTotal: 2500 });
   *
   * // Atualizar múltiplos campos
   * await repository.update("123", {
   *   valorTotal: 2500,
   *   disponivel: false,
   *   bairro: "Centro"
   * });
   */
  public async update(
    id_externo: string,
    updates: Partial<Omit<ImovelEntity, "idExterno">>
  ): Promise<number | undefined> {
    const db = await this.db;

    try {
      // Remove campos undefined ou null
      const validUpdates = this.removeInvalidFields(updates);

      // Valida se há campos para atualizar
      if (Object.keys(validUpdates).length === 0) {
        throw new Error("Nenhum campo válido fornecido para atualização");
      }

      // Converte valores para o formato do banco
      const sanitizedUpdates = this.sanitizeValues(validUpdates);

      // Constrói a query dinamicamente
      const setClause = this.buildSetClause(sanitizedUpdates);
      const values = this.extractValues(sanitizedUpdates, id_externo);

      // Executa o update
      const query = `UPDATE imoveis SET ${setClause} WHERE id_externo = ?`;
      const result = await db.run(query, values);

      // Valida se o registro foi atualizado
      if (result.changes === 0) {
        throw new Error(`Imóvel com ID ${id_externo} não encontrado`);
      }
      return result.lastID;
    } catch (error) {
      console.error("✗ Erro ao atualizar imóvel:", error);
      throw error;
    } finally {
      await db.close();
    }
  }

  /**
   * Remove campos undefined ou null do objeto
   */
  private removeInvalidFields(obj: any): any {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([_, value]) => value !== undefined && value !== null
      )
    );
  }

  /**
   * Converte valores booleanos para 0/1 (SQLite)
   */
  private sanitizeValues(obj: any): any {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (key === "disponivel" && typeof value === "boolean") {
        sanitized[key] = value ? 1 : 0;
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Constrói a cláusula SET da query (campo = ?, campo2 = ?)
   */
  private buildSetClause(updates: any): string {
    return Object.keys(updates)
      .map((field) => `${field} = ?`)
      .join(", ");
  }

  /**
   * Extrai os valores na ordem correta para a query
   */
  private extractValues(updates: any, id: string): any[] {
    return [...Object.values(updates), id];
  }
}
