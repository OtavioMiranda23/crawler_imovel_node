import ImovelEntity from "../../domain/entities/imovelEntity";
import ImovelRepository from "../../infra/database/repositories/imovelRepository";

export default class FindImoveis {
  constructor(readonly imovelRepository: ImovelRepository) {}
  public async execute(idsInsetedImoveis: number[]): Promise<ImovelEntity[]> {
    const imoveis: ImovelEntity[] = [];
    for (const id of idsInsetedImoveis) {
      const imovel = await this.imovelRepository.getById(id);
      if (imovel) {
        imoveis.push(imovel);
      }
    }
    return imoveis;
  }
}
