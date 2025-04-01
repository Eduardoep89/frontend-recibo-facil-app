import React from "react";
import style from "./Paginacao.module.css";

export function Paginacao({ paginaAtual, totalPaginas, onMudarPagina }) {
  const paginas = [];
  const maxBotoes = 5;

  let inicio = Math.max(1, paginaAtual - Math.floor(maxBotoes / 2));
  let fim = Math.min(totalPaginas, inicio + maxBotoes - 1);

  // Garante que sempre mostre 5 botões quando possível
  if (fim - inicio + 1 < maxBotoes) {
    inicio = Math.max(1, fim - maxBotoes + 1);
  }
  for (let i = inicio; i <= fim; i++) {
    paginas.push(
      <button
        key={i}
        className={`${style.botao_pagina} ${
          i === paginaAtual ? style.pagina_atual : ""
        }`}
        onClick={() => onMudarPagina(i)}
        aria-label={`Página ${i}`}
      >
        {i}
      </button>
    );
  }

  return (
    <div className={style.container_paginacao}>
      <button
        className={`${style.botao_navegacao} ${
          paginaAtual === 1 ? style.desabilitado : ""
        }`}
        onClick={() => onMudarPagina(1)}
        disabled={paginaAtual === 1}
        aria-label="Primeira página"
      >
        «
      </button>

      {inicio > 1 && <span className={style.pontos}>...</span>}
      {paginas}
      {fim < totalPaginas && <span className={style.pontos}>...</span>}

      <button
        className={`${style.botao_navegacao} ${
          paginaAtual === totalPaginas ? style.desabilitado : ""
        }`}
        onClick={() => onMudarPagina(totalPaginas)}
        disabled={paginaAtual === totalPaginas}
        aria-label="Última página"
      >
        »
      </button>
    </div>
  );
}
