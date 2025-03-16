import style from "./Sidebar.module.css";
import {
  MdTask,
  MdDesktopWindows,
  MdGroup,
  MdSort,
  MdReplay,
} from "react-icons/md";
import Logo from "../../assets/microservice.png";
import { SidebarItem } from "../SidebarItem/SidebarItem";

export function Sidebar({ children }) {
  return (
    <div>
      <div className={style.sidebar_conteudo}>
        <div className={style.sidebar_header}>
          <img src={Logo} alt="Logo-Microservice" className={style.logo} />
          <hr className={style.linha} />
        </div>

        <div className={style.sidebar_corpo}>
          <SidebarItem texto="Clientes" link="/usuarios" logo={<MdGroup />} />
          <SidebarItem texto="Produtos" link="/historias" logo={<MdSort />} />
        </div>
        <div className={style.sidebar_corpo}>
          <SidebarItem
            texto="Recibo"
            link="/projetos"
            logo={<MdDesktopWindows />}
          />
        </div>

        <div className={style.sidebar_corpo}>
          <SidebarItem
            texto="Link Nota Fiscal"
            link="/sprints"
            logo={<MdReplay />}
          />
        </div>
      </div>
      <div className={style.pagina_conteudo}>{children}</div>
    </div>
  );
}
