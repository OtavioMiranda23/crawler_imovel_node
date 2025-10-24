export default class ImovelEntity {
  public id: number | undefined;
  public bairro: string;
  public idExterno: string;
  public dataColeta: string;
  public metragem: number;
  public valorTotal: number;

  constructor(
    public endereco: string,
    public disponivel: boolean,
    public site: string,
    public link: string,
    public qtdQuartos: number,
    bairro: string,
    idExterno: string,
    dataColeta: string,
    metragem: number,
    valorTotal: number,
    id?: number
  ) {
    this.endereco = endereco;
    this.disponivel = disponivel;
    this.site = site;
    this.link = link;
    this.qtdQuartos = qtdQuartos;
    this.bairro = bairro;
    this.idExterno = idExterno;
    this.dataColeta = dataColeta;
    this.metragem = metragem;
    this.valorTotal = valorTotal;
    this.id = id;
  }

  /**
   * Factory method para criar do scraping (com validações e parsing)
   */
  static create(data: {
    endereco: string;
    valorTotalRaw: string;
    disponivel: boolean;
    site: string;
    link: string;
    qtdQuartos: number;
    metragemRaw: string;
  }): ImovelEntity {
    // Extrai e valida o ID externo
    const idExternoMatch = data.link.match(/\/imovel\/(\d+)\//);
    if (!idExternoMatch || idExternoMatch.length < 2 || !idExternoMatch[1]) {
      throw new Error(`ID externo não encontrado em ${data.link}`);
    }
    const idExterno = idExternoMatch[1];

    // Valida endereço
    if (!data.endereco) {
      throw new Error("endereco é obrigatório");
    }

    // Extrai e valida bairro
    const bairro = data.endereco.split("·")[0]?.split(",")[1]?.trim();
    if (!bairro) {
      throw new Error("bairro é obrigatório");
    }

    // Parse e valida valor total
    const valorTotalParsed = Number(
      data.valorTotalRaw
        .replace("R$", "")
        .replace(".", "")
        .replace("total", "")
        .trim()
    );
    if (!valorTotalParsed) {
      throw new Error("valorTotal é obrigatório");
    }

    // Valida disponibilidade
    if (data.disponivel === undefined || data.disponivel === null) {
      throw new Error("disponivel é obrigatório");
    }

    // Valida site
    if (data.site !== "Quinto Andar") {
      throw new Error("site deve ser 'Quinto Andar'");
    }

    // Valida link
    if (!data.link) {
      throw new Error("link é obrigatório");
    }

    // Valida quartos
    if (!data.qtdQuartos) {
      throw new Error("qtdQuartos é obrigatório");
    }

    // Parse e valida metragem
    if (!data.metragemRaw) {
      throw new Error("metragemRaw é obrigatório");
    }
    const metragemParsed = Number(data.metragemRaw.split(" ")[0]?.trim());

    // Data de coleta
    const dataColeta = new Date().toISOString();

    return new ImovelEntity(
      data.endereco,
      data.disponivel,
      data.site,
      data.link,
      data.qtdQuartos,
      bairro,
      idExterno,
      dataColeta,
      metragemParsed,
      valorTotalParsed
    );
  }
}
