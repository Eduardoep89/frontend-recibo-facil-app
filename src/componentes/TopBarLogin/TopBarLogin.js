import style from "./TopBarLogin.module.css";

export function TopBarLogin({ children }) {
  return (
    <div>
      <div className={style.topbarr_conteudo}></div>
      <div className={style.pagina_conteudo}>{children}</div>
    </div>
  );
}
