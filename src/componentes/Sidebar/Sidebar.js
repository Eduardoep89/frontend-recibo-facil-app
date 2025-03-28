import React from "react";
import style from "./Sidebar.module.css";
import { MdGroup } from "react-icons/md";
import Logo from "../../assets/microservice.png";
import { SidebarItem } from "../SidebarItem/SidebarItem";
import { GiBoxUnpacking, GiArtificialIntelligence } from "react-icons/gi";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { PiLinkFill } from "react-icons/pi";

export function Sidebar({ children }) {
  return (
    <div>
      <div className={style.sidebar_conteudo}>
        <div className={style.sidebar_header}>
          <img src={Logo} alt="Logo-Microservice" className={style.logo} />
          <hr className={style.linha} />
        </div>

        <div className={style.sidebar_corpo}>
          <SidebarItem texto="Clientes" link="/clientes" logo={<MdGroup />} />
          <SidebarItem
            texto="Produtos/Serviços"
            link="/produtos"
            logo={<GiBoxUnpacking />}
          />
        </div>

        <div className={style.sidebar_corpo}>
          <SidebarItem
            texto="Recibo"
            link="/recibos"
            logo={<FaFileInvoiceDollar />}
          />
        </div>

        {/* Novo item de IA */}
        <div className={style.sidebar_corpo}>
          <SidebarItem
            texto="Relatórios IA"
            link="/relatorios"
            logo={<GiArtificialIntelligence />}
          />
        </div>

        <div className={style.sidebar_corpo}>
          <SidebarItem
            texto="NF-e"
            link="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/nota-fiscal/nota-fiscal-de-servico-eletronica-nfs-e"
            logo={<PiLinkFill />}
          />
        </div>
      </div>
      <div className={style.pagina_conteudo}>{children}</div>
    </div>
  );
}
