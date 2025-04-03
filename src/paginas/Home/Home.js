import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./Home.module.css";

export function Home() {
  return (
    <div className={style.conteudo}>
      <Sidebar />
      <div className={style.pagina_conteudo}>
        <Topbar />
        <div className={style.bem_vindo}>Bem-vindo ao Recibo Fácil!</div>
        <div className={style.descricao}>
          Gerencie seus recibos, clientes e produtos de forma simples e rápida.
          Explore as funcionalidades e aproveite!
        </div>
      </div>
    </div>
  );
}
