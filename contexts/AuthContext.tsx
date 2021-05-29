import Router from "next/router";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/apiClient";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

// Avisar quando o usuário for deslogado para toda a aplicação com BroadcastChannel
let authChannel: BroadcastChannel;

export const signOut = () => {
  destroyCookie(undefined, "nextauth.token");
  destroyCookie(undefined, "nextauth.refreshToken");

  authChannel.postMessage("signOut");

  Router.push("/");
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user; // se estiver vazio retorna false, senão true.

  useEffect(() => {
    authChannel = new BroadcastChannel("auth");

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case "signOut":
          signOut();
          break;
        default:
          break;
      }
    };
  }, []);

  // pegar informações do usuário no backend, toda vez que recarregar a página
  useEffect(() => {
    const { "nextauth.token": token } = parseCookies(); // método para acessar todos os dados dos cookies

    if (token) {
      api
        .get("/me")
        .then((response) => {
          // buscando essas informações novamente toda vez que o usuário recarrega a página
          const { email, permissions, roles } = response.data;

          setUser({ email, permissions, roles });
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    // muito importante ao fazer requisições pra api, fazer tratamento de excessões
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });

      // informações que vem do backend
      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, "nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      setCookie(undefined, "nextauth.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      // esses dados vem do backend quando fazemos autenticação
      setUser({
        email,
        permissions,
        roles,
      });

      // atualizando o token ao fazer signIn
      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      Router.push("/dashboard");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}

// formas de redirecionar o usuário para outra página:
// 1: "import {useRouter} from "next/router" =>
// Dentro do componente: const router = useRouter()

// 2: "import {Router} from "next/router"
// Dentro do componente: Router.push("/dashboard")

// Temos 3 formas de armazenar o token e refresh token do usuário:
// SessionStorage -> Só dura com uma sessão do usuário

// LocalStorage -> O next não é apenas browser, e quando estamos criando a interface/operações
// pelo lado do servidor no next eu nao tenho acesso ao LocalStorage

//Cookies -> Pode ser acessado tanto pelo lado do browser, quanto do servidor
