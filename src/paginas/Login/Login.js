import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import style from "./Login.module.css";
import logo from "../../assets/microservice.png";
import backgroundImage from "../../assets/LoginImpressora.png";

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
    <div
      className={style.loginContainer}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "100%",
        backgroundPosition: "center 80%",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        filter: "brightness(0.9) saturate(1.5)",
      }}
    >
      <div className={style.overlay}></div>

      <form onSubmit={handleSubmit} className={style.loginForm}>
        <img src={logo} alt="Logo Microservice" className={style.logo} />

        {erro && <div className={style.erro}>{erro}</div>}

        <div className={style.inputGroup}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={style.inputGroup}>
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className={style.botaoLogin}
          disabled={carregando}
        >
          {carregando ? "Carregando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
