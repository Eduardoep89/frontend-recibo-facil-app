import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import style from "../Login/Login.module.css";
import logo from "../../assets/microservice.png";
import { TopBarLogin } from "../../componentes/TopBarLogin/TopBarLogin";

export function Registro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const { registrar, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    try {
      await registrar(nome, email, senha);
      navigate("/home"); // Adicione esta linha
    } catch (error) {
      setErro(error.message || "Erro ao registrar");
    }
  };

  return (
    <TopBarLogin>
      <div className={style.loginContainer}>
        <div className={style.overlay}></div>

        <form onSubmit={handleSubmit} className={style.loginForm}>
          <img src={logo} alt="Logo Microservice" className={style.logo} />

          <h2 className={style.titulo}>Criar Conta</h2>

          {erro && <div className={style.erro}>{erro}</div>}

          <div className={style.inputGroup}>
            <input
              id="nome"
              type="text"
              placeholder=" "
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <label htmlFor="nome">Nome Completo</label>
          </div>

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

          <div className={style.inputGroup}>
            <input
              id="confirmarSenha"
              type="password"
              placeholder=" "
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              minLength={6}
            />
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
          </div>

          <button type="submit" className={style.botaoLogin} disabled={loading}>
            {loading ? "Carregando..." : "Registrar"}
          </button>

          <div className={style.rodapeForm}>
            <p>
              Já tem uma conta?{" "}
              <button
                type="button"
                className={style.botaoLink}
                onClick={() => navigate("/login")}
              >
                Fazer Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </TopBarLogin>
  );
}
