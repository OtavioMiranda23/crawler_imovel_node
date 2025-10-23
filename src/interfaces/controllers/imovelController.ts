import { Request, Response } from "express";
import ImovelEntity from "../../domain/entities/imovelEntity";
import CollectImovel from "../../application/usecases/collectImovel";

export default class ImovelController {
  constructor(readonly collectImovel: CollectImovel) {}
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
      const imoveis = await this.collectImovel.execute(url);
      res.status(200).json(imoveis);
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}
