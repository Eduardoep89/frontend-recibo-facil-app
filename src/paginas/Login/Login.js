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
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      if (email && senha) {
        login({ email });
        navigate("/home");
      } else {
        setErro("Por favor, preencha todos os campos");
      }
    } catch (error) {
      setErro("Erro ao fazer login");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <TopBarLogin>
      <div className={style.loginContainer}>
        <div className={style.overlay}></div>

        <form onSubmit={handleSubmit} className={style.loginForm}>
          <img src={logo} alt="Logo Microservice" className={style.logo} />

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
            />
            <label htmlFor="senha">Senha</label>
          </div>

          <button
            type="submit"
            className={style.botaoLogin}
            disabled={carregando}
          >
            {carregando ? "Carregando..." : "Acessar"}
          </button>
        </form>
      </div>
    </TopBarLogin>
  );
}
