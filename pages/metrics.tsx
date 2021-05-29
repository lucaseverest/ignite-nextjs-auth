import { setupAPIClient } from "../services/api";
import { whithSSRAuth } from "../utils/whithSSRAuth";

export default function Metrics() {
  return (
    <>
      <h1>Metrics</h1>
    </>
  );
}

// caso o usuário não esteja com o token, ele nem chega a ver a pagina,
// é diretamente direcionado para a página de login.
export const getServerSideProps = whithSSRAuth(
  async (ctx) => {
    //agora nosso cliente http do axios vai buscar os cookies de boassa
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get("/me");

    return {
      props: {},
    };
  },
  // esse segundo parâmetro são requisitos para poder acessa a página que vem no token (informações incriptadas do token)
  {
    permissions: ["metrics.list"],
    roles: ["administrator"],
  }
);
