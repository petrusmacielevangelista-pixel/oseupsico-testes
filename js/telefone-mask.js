/* ============================================================
   Máscara de telefone com seletor de país (bandeira + código).

   IMPORTANTE (compatibilidade): números do Brasil continuam sendo
   salvos EXATAMENTE no mesmo formato de antes — "(XX) XXXXX-XXXX",
   sem prefixo "+55" — porque o e-mail e telefone digitados aqui
   precisam bater, caractere a caractere, com o que já está gravado
   no banco pra quem se cadastrou antes desta mudança (usado na
   consulta/exclusão de dados). Só números de outros países ganham
   o prefixo "+<código>", já que antes só existia formato brasileiro.
   ============================================================ */

'use strict';

const PAISES_TELEFONE = [
  { code: 'BR', dial: '55',  flag: '🇧🇷', nome: 'Brasil' },
  { code: 'US', dial: '1',   flag: '🇺🇸', nome: 'Estados Unidos' },
  { code: 'CA', dial: '1',   flag: '🇨🇦', nome: 'Canadá' },
  { code: 'PT', dial: '351', flag: '🇵🇹', nome: 'Portugal' },
  { code: 'AR', dial: '54',  flag: '🇦🇷', nome: 'Argentina' },
  { code: 'MX', dial: '52',  flag: '🇲🇽', nome: 'México' },
  { code: 'CO', dial: '57',  flag: '🇨🇴', nome: 'Colômbia' },
  { code: 'CL', dial: '56',  flag: '🇨🇱', nome: 'Chile' },
  { code: 'UY', dial: '598', flag: '🇺🇾', nome: 'Uruguai' },
  { code: 'PY', dial: '595', flag: '🇵🇾', nome: 'Paraguai' },
  { code: 'ES', dial: '34',  flag: '🇪🇸', nome: 'Espanha' },
  { code: 'GB', dial: '44',  flag: '🇬🇧', nome: 'Reino Unido' },
  { code: 'DE', dial: '49',  flag: '🇩🇪', nome: 'Alemanha' },
  { code: 'FR', dial: '33',  flag: '🇫🇷', nome: 'França' },
  { code: 'IT', dial: '39',  flag: '🇮🇹', nome: 'Itália' },
];

function formatarNumeroTelefone(digitos, paisCode) {
  if (paisCode === 'BR') {
    // Mantém idêntico ao mask original — não "corrigir" a formatação
    // de fixos (10 dígitos), pra não gerar strings diferentes das já
    // salvas no banco pra quem se cadastrou antes desta mudança.
    const v = digitos.slice(0, 11);
    if (v.length > 6) return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    if (v.length > 2) return `(${v.slice(0,2)}) ${v.slice(2)}`;
    if (v.length > 0) return `(${v}`;
    return '';
  }
  if (paisCode === 'US' || paisCode === 'CA') {
    const v = digitos.slice(0, 10);
    if (v.length > 6) return `(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`;
    if (v.length > 3) return `(${v.slice(0,3)}) ${v.slice(3)}`;
    if (v.length > 0) return `(${v}`;
    return '';
  }
  // Genérico: agrupa de 3 em 3 sem forçar um formato específico —
  // cobre os demais países sem impor uma máscara incorreta.
  return digitos.slice(0, 15).replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}

/* Liga o seletor de país + máscara a um <input type="tel"> e um <select> */
function initTelefoneMask(inputId, selectId, defaultCode = 'BR') {
  const input = document.getElementById(inputId);
  const select = document.getElementById(selectId);
  if (!input || !select) return;

  select.innerHTML = PAISES_TELEFONE.map(p =>
    `<option value="${p.code}">${p.flag} +${p.dial}</option>`
  ).join('');
  select.value = defaultCode;

  function paisAtual() {
    return PAISES_TELEFONE.find(p => p.code === select.value) || PAISES_TELEFONE[0];
  }

  input.addEventListener('input', () => {
    // Só tenta detectar o país pelo prefixo se a pessoa (ou o
    // preenchimento automático) digitou um "+" na frente — evita
    // confundir um DDD brasileiro que começa com "1" (ex.: 11, 12...)
    // com o código +1 dos EUA/Canadá.
    const temSinalMais = input.value.trim().startsWith('+');
    let digitos = input.value.replace(/\D/g, '');
    let pais = paisAtual();

    if (temSinalMais) {
      const porTamanhoDial = [...PAISES_TELEFONE].sort((a, b) => b.dial.length - a.dial.length);
      const match = porTamanhoDial.find(p => digitos.startsWith(p.dial));
      if (match) {
        pais = match;
        digitos = digitos.slice(match.dial.length);
        if (select.value !== pais.code) select.value = pais.code;
      }
    }

    input.value = formatarNumeroTelefone(digitos, pais.code);
  });

  select.addEventListener('change', () => {
    const digitos = input.value.replace(/\D/g, '');
    input.value = formatarNumeroTelefone(digitos, select.value);
  });
}

/* Telefone final pra enviar à API — sem prefixo pro Brasil (compatibilidade
   com registros antigos), com "+<código>" pros demais países. */
function telefoneParaEnvio(inputId, selectId) {
  const input = document.getElementById(inputId);
  const select = document.getElementById(selectId);
  const numero = input.value.trim();
  if (!numero) return '';
  if (select.value === 'BR') return numero;
  const pais = PAISES_TELEFONE.find(p => p.code === select.value);
  return pais ? `+${pais.dial} ${numero}` : numero;
}

function telefoneValido(inputId, selectId) {
  const input = document.getElementById(inputId);
  const select = document.getElementById(selectId);
  const digitos = input.value.replace(/\D/g, '');
  if (select.value === 'BR') return digitos.length >= 10;
  if (select.value === 'US' || select.value === 'CA') return digitos.length === 10;
  return digitos.length >= 7;
}
