import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { FormEvent, useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import styles from "../styles/Home.module.css";
import { whithSSRGuest } from "../utils/whithSSRGuest";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); // evitar o reload padrão do formulário

    const data = {
      email,
      password,
    };

    await signIn(data);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Entrar</button>
    </form>
  );
}

// Hight order function
export const getServerSideProps = whithSSRGuest(async (ctx) => {
  return {
    props: {},
  };
});

// A autenticação é algo que vou precisão em todas as páginas/componentes da aplicação
// por isso, a primeira coisa que preciso fazer é um contexto pra compartilhar esses dados
