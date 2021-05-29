export class AuthTokenError extends Error {
  constructor() {
    super("Error with authentication token");
  }
}
// consigo diferenciar um erro do outro quando crio uma nova classe de erro, deixar só erro é muito genérico, pode ser qualquer erro
