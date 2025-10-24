import express from "express";
import CollectImoveis from "./application/usecases/collectImoveis";
import FindImoveis from "./application/usecases/findImoveis";
import PersistImoveis from "./application/usecases/persistImoveis";
import ImovelRepository from "./infra/database/repositories/imovelRepository";
import ImovelController from "./interfaces/controllers/imovelController";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const imovelRepository = new ImovelRepository();
const usecaseCollectImoveis = new CollectImoveis();
const usecasePersistImoveis = new PersistImoveis(imovelRepository);
const usecaseFindImoveis = new FindImoveis(imovelRepository);

const imovelController = new ImovelController(
  usecaseCollectImoveis,
  usecasePersistImoveis,
  usecaseFindImoveis
);

app.get("/", (req, res) => {
  res.json({
    message: "API de Imóveis está funcionando! 🚀",
    version: "1.0.0",
  });
});

app.post("/api/imoveis", (req, res) =>
  imovelController.getAllImoveis(req, res)
);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Erro não tratado:", err);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: err.message,
    });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
