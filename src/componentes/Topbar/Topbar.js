import style from "./Topbar.module.css";
import { useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { useAuth } from "../../contexts/AuthContext"; // Importe o useAuth

export function Topbar({ children }) {
  const { logout } = useAuth(); // Obtenha a função logout do contexto
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // Chama a função de logout do contexto
      navigate("/login"); // Redireciona após o logout
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      navigate("/login"); // Redireciona mesmo se houver erro
    }
  };

  return (
    <div>
      <div className={style.topbar_conteudo}>
        <button
          onClick={handleLogout} // Altere para onClick
          className={style.botao_deslogar}
        >
          <MdLogout />
        </button>
      </div>
      <div className={style.pagina_conteudo}>{children}</div>
    </div>
  );
}
