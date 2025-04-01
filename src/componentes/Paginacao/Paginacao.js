import React from "react";
import style from "./Paginacao.module.css";

export function Paginacao({
  paginaAtual,
  totalPaginas,
  itensPorPagina,
  totalRegistros,
  onPaginaChange,
  onItensPorPaginaChange,
}) {
  const paginasParaMostrar = 5; // Quantidade de números de página para mostrar
  let inicio = Math.max(1, paginaAtual - Math.floor(paginasParaMostrar / 2));
  let fim = Math.min(totalPaginas, inicio + paginasParaMostrar - 1);

  // Ajusta se não estamos mostrando páginas suficientes
  if (fim - inicio + 1 < paginasParaMostrar) {
    inicio = Math.max(1, fim - paginasParaMostrar + 1);
  }

  const paginas = [];
  for (let i = inicio; i <= fim; i++) {
    paginas.push(i);
  }

  return (
    <div className={style.paginacao_container}>
      <div className={style.paginacao_info}>
        Mostrando {(paginaAtual - 1) * itensPorPagina + 1} -{" "}
        {Math.min(paginaAtual * itensPorPagina, totalRegistros)} de{" "}
        {totalRegistros} registros
      </div>

      <div className={style.paginacao_controles}>
        <button
          onClick={() => onPaginaChange(1)}
          disabled={paginaAtual === 1}
          className={style.paginacao_botao}
        >
          «
        </button>
        <button
          onClick={() => onPaginaChange(paginaAtual - 1)}
          disabled={paginaAtual === 1}
          className={style.paginacao_botao}
        >
          ‹
        </button>

        {inicio > 1 && (
          <>
            <button
              onClick={() => onPaginaChange(1)}
              className={style.paginacao_botao}
            >
              1
            </button>
            {inicio > 2 && (
              <span className={style.paginacao_ellipsis}>...</span>
            )}
          </>
        )}

        {paginas.map((pagina) => (
          <button
            key={pagina}
            onClick={() => onPaginaChange(pagina)}
            className={`${style.paginacao_botao} ${
              pagina === paginaAtual ? style.paginacao_botao_ativo : ""
            }`}
          >
            {pagina}
          </button>
        ))}

        {fim < totalPaginas && (
          <>
            {fim < totalPaginas - 1 && (
              <span className={style.paginacao_ellipsis}>...</span>
            )}
            <button
              onClick={() => onPaginaChange(totalPaginas)}
              className={style.paginacao_botao}
            >
              {totalPaginas}
            </button>
          </>
        )}

        <button
          onClick={() => onPaginaChange(paginaAtual + 1)}
          disabled={paginaAtual === totalPaginas}
          className={style.paginacao_botao}
        >
          ›
        </button>
        <button
          onClick={() => onPaginaChange(totalPaginas)}
          disabled={paginaAtual === totalPaginas}
          className={style.paginacao_botao}
        >
          »
        </button>
      </div>

      <div className={style.paginacao_por_pagina}>
        <label htmlFor="itensPorPagina">Itens por página:</label>
        <select
          id="itensPorPagina"
          value={itensPorPagina}
          onChange={(e) => onItensPorPaginaChange(Number(e.target.value))}
          className={style.paginacao_select}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}
