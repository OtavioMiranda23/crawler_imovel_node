import ImovelEntity from "../../domain/entities/imovelEntity";
import ImovelRepository from "../../infra/database/repositories/imovelRepository";

export default class PersistImoveis {
  constructor(private imovelRepository: ImovelRepository) {}
  public async execute(imoveis: ImovelEntity[]): Promise<number[]> {
    return this.insertImoveis(imoveis);
  }

  private async insertImoveis(imoveis: ImovelEntity[]): Promise<number[]> {
    const successfulInsertedsImoveisIds: number[] = [];
    for (const imovel of imoveis) {
      //atualizar todos os imoveis existentes para indisponiveis
      this.imovelRepository.update(imovel.idExterno, { disponivel: false });
      const foundedImovel = this.imovelRepository.getByIdExterno(
        imovel.idExterno
      );
      if (!foundedImovel) {
        //se não estiver, inserir o imovel no banco
        const idSavedImovel = await this.imovelRepository.save(imovel);
        if (!idSavedImovel) continue;
        successfulInsertedsImoveisIds.push(idSavedImovel);
      } else {
        //se o imovel estiver na lista, atualizar para disponivel
        const idUpdatedImovel = await this.imovelRepository.update(
          imovel.idExterno,
          { disponivel: true }
        );
        if (!idUpdatedImovel) continue;
        successfulInsertedsImoveisIds.push(idUpdatedImovel);
      }
    }
    return successfulInsertedsImoveisIds;
  }
}
