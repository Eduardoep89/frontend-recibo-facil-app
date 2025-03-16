import style from "./SidebarItem.module.css";
import { Link } from "react-router-dom";

export function SidebarItem({ texto, link, logo }) {
  const isExternal = link.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={style.sidebar_item}
      >
        {logo}
        <h3 className={style.texto_link}>{texto}</h3>
      </a>
    );
  }

  return (
    <Link to={link} className={style.sidebar_item}>
      {logo}
      <h3 className={style.texto_link}>{texto}</h3>
    </Link>
  );
}
