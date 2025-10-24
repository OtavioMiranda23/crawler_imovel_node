import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import "chromedriver";
import ImovelEntity from "../../domain/entities/imovelEntity";

export default class CollectImoveis {
  constructor() {}
  public async execute(url: string): Promise<ImovelEntity[]> {
    console.log("Iniciando o navegador...");
    // Configuração do Chrome
    const options = new chrome.Options();
    options.addArguments("--headless"); // Descomente para modo headless
    options.addArguments("--disable-gpu");
    options.addArguments("--no-sandbox");
    options.addArguments("--start-maximized");

    const driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    try {
      console.log("Navegador iniciado!");
      console.log("Página carregada, buscando botão 'Ver Mais'...");
      const searchButtonVerMais = By.id("see-more");
      // Wait until the "Ver Mais" button is loaded
      const button = await driver.wait(
        until.elementLocated(searchButtonVerMais),
        10000
      );
      console.log("Botão encontrado, clicando...");
      await button.click();
      const searchAllCards = By.css(
        "[data-testid='house-card-container-rent']"
      );
      const cards = await driver.findElements(searchAllCards);
      console.log("Botão clicado com sucesso!");
      const imoveis: ImovelEntity[] = [];
      for (const card of cards) {
        const metragemRaw = await card
          .findElement(By.css(".Cozy__CardContent-Container h3.CozyTypography"))
          .getText();
        const valorTotalRaw = await card
          .findElement(By.css(".Cozy__CardTitle-Subtitle .CozyTypography"))
          .getText();
        const link = await card.findElement(By.css("a")).getAttribute("href");
        const enderecos = await card.findElements(
          By.css(".Cozy__CardContent-Container h2.CozyTypography")
        );

        const lastEnderecoElement = enderecos[enderecos.length - 1];
        if (!lastEnderecoElement) {
          console.error("Elemento de endereço está indefinido, pulando...");
          throw new Error("Endereço não encontrado");
        }
        const endereco = await lastEnderecoElement.getText();
        const imovel = ImovelEntity.create({
          endereco,
          valorTotalRaw,
          disponivel: true,
          site: "Quinto Andar",
          link,
          qtdQuartos: 2,
          metragemRaw,
        });
        imoveis.push(imovel);
      }
      await driver.quit();
      console.log("Imóveis coletados:", imoveis);
      return imoveis;
    } catch (error) {
      console.error("Erro durante a execução:", error);
      throw error;
    } finally {
      console.log("Fechando navegador...");
      await driver.quit();
      console.log("Navegador fechado!");
    }
  }
}
