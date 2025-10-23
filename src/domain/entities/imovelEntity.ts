export default class ImovelEntity {
  private bairro: string;
  private idExterno: string;
  private dataColeta: string;
  private metragem: number;
  private valorTotal: number;

  constructor(
    private endereco: string,
    valorTotalRaw: string,
    private disponivel: boolean,
    private site: string,
    private link: string,
    private qtd_quartos: number,
    metragemRaw: string
  ) {
    const idExterno = link.match(/\/imovel\/(\d+)\//);
    if (!idExterno || idExterno.length < 2 || !idExterno[1]) {
      throw new Error(`ID externo não encontrado em ${link}`);
    }
    this.idExterno = idExterno[1];
    if (!endereco) {
      throw new Error("endereco é obrigatório");
    }
    this.dataColeta = new Date().toISOString();
    this.endereco = endereco;
    const bairro = endereco.split("·")[0]?.split(",")[1]?.trim();
    if (!bairro) {
      throw new Error("bairro é obrigatório");
    }
    this.bairro = bairro;
    const valorTotalParsed = Number(
      valorTotalRaw
        .replace("R$", "")
        .replace(".", "")
        .replace("total", "")
        .trim()
    );
    if (!valorTotalParsed) {
      throw new Error("valorTotal é obrigatório");
    }
    this.valorTotal = valorTotalParsed;
    if (disponivel === undefined || disponivel === null) {
      throw new Error("disponivel é obrigatório");
    }
    this.disponivel = disponivel;
    if (site !== "Quinto Andar") {
      throw new Error("site deve ser 'Quinto Andar'");
    }
    this.site = site;
    if (!link) {
      throw new Error("link é obrigatório");
    }
    this.link = link;
    if (!qtd_quartos) {
      throw new Error("qtd_quartos é obrigatório");
    }
    this.qtd_quartos = qtd_quartos;
    if (!metragemRaw) {
      throw new Error("metragemRaw é obrigatório");
    }
    const metragemParsed = Number(metragemRaw.split(" ")[0]?.trim());
    this.metragem = metragemParsed;
  }
}
