import { useContext, useEffect } from "react";
import { Can } from "../components/Can";
import { AuthContext } from "../contexts/AuthContext";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { whithSSRAuth } from "../utils/whithSSRAuth";

export default function Dashboard() {
  const { user, signOut } = useContext(AuthContext);

  useEffect(() => {
    api
      .get("/me")
      .then((response) => console.log(response))
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      <h1>Dashboad: {user?.email}</h1>

      <button onClick={signOut}>Sign out</button>

      <Can permissions={["metrics.list"]}>
        <div>Métricas</div>
      </Can>
    </>
  );
}

// caso o usuário não esteja com o token, ele nem chega a ver a pagina,
// é diretamente direcionado para a página de login.
export const getServerSideProps = whithSSRAuth(async (ctx) => {
  //agora nosso cliente http do axios vai buscar os cookies de boassa
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get("/me");

  return {
    props: {},
  };
});
