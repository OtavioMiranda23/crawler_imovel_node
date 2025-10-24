import { Request, Response } from "express";
import ImovelEntity from "../../domain/entities/imovelEntity";
import CollectImoveis from "../../application/usecases/collectImoveis";
import PersistImoveis from "../../application/usecases/persistImoveis";
import FindImoveis from "../../application/usecases/findImoveis";

export default class ImovelController {
  constructor(
    readonly collectImoveis: CollectImoveis,
    readonly persistImoveis: PersistImoveis,
    readonly findImoveis: FindImoveis
  ) {}
  public async getAllImoveis(
    req: Request,
    res: Response
  ): Promise<ImovelEntity[] | void> {
    try {
      const { url } = req.query;
      if (typeof url !== "string") {
        res.status(400).json({ error: "URL inválida" });
        return;
      }
      const imoveis = await this.collectImoveis.execute(url);
      const idsInsertedImoveis = await this.persistImoveis.execute(imoveis);
      const imoveisFounded = await this.findImoveis.execute(idsInsertedImoveis);
      const result = {
        data: imoveisFounded,
        count: imoveisFounded.length,
      };
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}
