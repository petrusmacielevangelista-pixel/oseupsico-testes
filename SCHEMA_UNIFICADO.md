# Schema unificado — tabela `participantes` (pós-migração IGT)

## Tabela nova

```sql
CREATE TABLE IF NOT EXISTS participantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  idade INTEGER,
  tipo TEXT NOT NULL,              -- 'rastreio' | 'desempenho' | 'bateria'
  identificador TEXT NOT NULL,     -- tema (rastreio) | instrumento (desempenho) | id da bateria
  faixa_geral TEXT,                -- resumo geral quando aplicável (pior faixa entre as escalas)
  resultados TEXT NOT NULL,        -- JSON, formato varia por tipo (ver abaixo)
  consentimento_dados_em TEXT,     -- timestamp do checkbox 1 (uso de dados)
  consentimento_instrumento_em TEXT, -- timestamp do checkbox 2 (entendimento do instrumento)
  criado_em TEXT DEFAULT (datetime('now'))
)
```

## Formato de `resultados` por tipo

- **rastreio**: `{ "<escalaId>": { score, scoreMax, faixa, classe, texto } }` — igual ao formato atual, sem mudança
- **desempenho**: `{ score, faixa, classe, metricas: {...} }` — `metricas` livre por instrumento (ex.: IGT usa `contagem`, `quintos`, `saldo_final`; Stroop usaria tempo de reação médio, acurácia; etc.)
- **bateria**: `{ "<escalaOuInstrumentoId>": {...} }` — mesmo formato de rastreio/desempenho, só que com múltiplas entradas de instrumentos diferentes sob o mesmo registro

## Migração de dados existentes

- **De `participantes` (Testes) →** `tipo = 'rastreio'`, `identificador = tema`, resto copiado direto
- **De `participantes_igt` (IGT) →** `tipo = 'desempenho'`, `identificador = 'igt'`, `telefone = NULL` (IGT nunca coletou), `resultados = { score, faixa, classe, metricas: { contagem, quintos, saldo_final } }`
- Nenhum registro é apagado das tabelas originais até a migração ser validada em produção
