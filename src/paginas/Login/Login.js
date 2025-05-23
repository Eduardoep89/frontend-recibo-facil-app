import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import style from "./Login.module.css";
import logo from "../../assets/microservice.png";
import { TopBarLogin } from "../../componentes/TopBarLogin/TopBarLogin";

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    try {
      await login(email, senha);
      navigate("/"); // redireciona para a home ou dashboard
    } catch (error) {
      setErro(error.message || "Erro ao fazer login");
    }
  };

  return (
    <TopBarLogin>
      <div className={style.loginContainer}>
        <div className={style.overlay}></div>

        <form onSubmit={handleSubmit} className={style.loginForm}>
          <img src={logo} alt="Logo Microservice" className={style.logo} />

          <h2 className={style.titulo}>Login</h2>

          {erro && <div className={style.erro}>{erro}</div>}

          <div className={style.inputGroup}>
            <input
              id="email"
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">E-mail</label>
          </div>

          <div className={style.inputGroup}>
            <input
              id="senha"
              type="password"
              placeholder=" "
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
            />
            <label htmlFor="senha">Senha</label>
          </div>

          <button type="submit" className={style.botaoLogin} disabled={loading}>
            {loading ? "Carregando..." : "Acessar"}
          </button>

          <div className={style.rodapeForm}>
            <p>
              Não tem uma conta?{" "}
              <button
                type="button"
                className={style.botaoLink}
                onClick={() => navigate("/registrar")}
              >
                Registrar-se
              </button>
            </p>
          </div>
        </form>
      </div>
    </TopBarLogin>
  );
}
