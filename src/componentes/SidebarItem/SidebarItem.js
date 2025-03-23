import React from "react";
import style from "./SidebarItem.module.css";
import { Link, useLocation } from "react-router-dom";

export function SidebarItem({ texto, link, logo }) {
  const location = useLocation();
  const isExternal = link.startsWith("http");
  const isAtivo = location.pathname === link;

  if (isExternal) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`${style.sidebar_item} ${isAtivo ? style.ativo : ""}`}
      >
        {logo}
        <h3 className={style.texto_link}>{texto}</h3>
      </a>
    );
  }

  return (
    <Link
      to={link}
      className={`${style.sidebar_item} ${isAtivo ? style.ativo : ""}`}
    >
      {logo}
      <h3 className={style.texto_link}>{texto}</h3>
    </Link>
  );
}
