/* ============================================================
   O SEU PSICO — Testes · Cloudflare Worker
   Rotas:
     POST /api/resultado        → salva resultado + envia e-mail
     POST /api/admin/login      → autenticação admin
     GET  /api/admin/dados      → lista registros (protegido)
     GET/POST /auth /callback   → OAuth Decap CMS
   ============================================================ */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

const WHATSAPP_NUMERO = '5511945556826';

/* ── Textos interpretativos por escala e por faixa ──
   Fontes oficiais quando disponíveis (Kroenke et al., Beck & Steer, National
   Center for PTSD, Morin, Ferris & Wynne, OMS/Babor et al., Young, Robins et al.,
   Hirschfeld et al.). Para escalas sem redação oficial publicada por faixa
   (SCARED, ASRS itens complementares, SNAP-IV, AQ-10, MBI-GS, PSS-10,
   WHOQOL-BREF), o texto foi elaborado de forma genérica a partir do
   significado geral da faixa de escore. */
const ESCALA_TEXTOS = {
  phq9: {
    minimal: 'Sintomas mínimos — o indicado é apenas monitorar como você está se sentindo ao longo do tempo.',
    mild: 'Sintomas leves de depressão, com tendência a melhorar com pouca intervenção ou acompanhamento breve.',
    moderate: 'Sintomas moderados que costumam se beneficiar de um acompanhamento estruturado com um profissional.',
    severe: 'Sintomas de intensidade elevada, para os quais um acompanhamento psicológico mais robusto — e, em alguns casos, avaliação médica complementar — costuma ser indicado.',
  },
  phqa: {
    minimal: 'Sintomas mínimos — o indicado é apenas monitorar como você está se sentindo ao longo do tempo.',
    mild: 'Sintomas leves de depressão, com tendência a melhorar com pouca intervenção ou acompanhamento breve.',
    moderate: 'Sintomas moderados que costumam se beneficiar de um acompanhamento estruturado com um profissional.',
    severe: 'Sintomas de intensidade elevada, para os quais um acompanhamento psicológico mais robusto costuma ser indicado.',
  },
  bai: {
    minimal: 'Sintomas de ansiedade mínimos ou ausentes.',
    mild: 'Sintomas presentes, mas geralmente administráveis no dia a dia.',
    moderate: 'Sintomas mais persistentes, que já começam a interferir nas atividades diárias.',
    severe: 'Sintomas intensos e angustiantes, que tendem a prejudicar significativamente o funcionamento e a qualidade de vida.',
  },
  scared: {
    minimal: 'Sem indicativo relevante de ansiedade nesta avaliação.',
    mild: 'Alguns sinais de ansiedade presentes, que vale a pena observar com atenção.',
    severe: 'Sinais de ansiedade em nível elevado, que sugerem conversar com um profissional especializado no público infantojuvenil.',
  },
  asrs: {
    minimal: 'Padrão de respostas não sugestivo de TDAH no rastreio da Parte A.',
    severe: 'Padrão de respostas compatível com TDAH no rastreio da Parte A — isso não é um diagnóstico, mas indica que vale a pena uma avaliação especializada.',
  },
  snapiv: {
    minimal: 'Sintomas relatados pelo responsável não sugerem TDAH nesta avaliação.',
    mild: 'Alguns sintomas presentes, próximos ao que costuma ser considerado clinicamente relevante.',
    severe: 'Sintomas relatados em nível compatível com TDAH — uma avaliação especializada pode esclarecer melhor o quadro.',
  },
  aq10: {
    minimal: 'Rastreio não sugestivo de características do espectro autista.',
    severe: 'Rastreio sugestivo de características associadas ao espectro autista — vale conversar com um profissional especializado para uma avaliação mais aprofundada.',
  },
  mchatr: {
    minimal: 'Baixo risco de TEA nesta triagem — sem necessidade de ação adicional agora.',
    moderate: 'Risco moderado — recomenda-se aplicar a etapa de acompanhamento (M-CHAT-R/F) para esclarecer melhor as respostas antes de qualquer encaminhamento.',
    severe: 'Alto risco — o recomendado é buscar avaliação especializada o quanto antes.',
  },
  pcl5: {
    minimal: 'Sintomas atuais abaixo do limiar de significância clínica para TEPT.',
    severe: 'Pontuação compatível com TEPT provável — uma avaliação clínica formal é a forma correta de confirmar isso.',
  },
  isi: {
    minimal: 'Sem insônia clinicamente significativa.',
    mild: 'Insônia em nível subclínico — vale cuidar da higiene do sono.',
    moderate: 'Insônia de gravidade moderada, que já costuma justificar avaliação profissional.',
    severe: 'Insônia de gravidade importante, com indicação de avaliação e tratamento especializado.',
  },
  mbigs: {
    minimal: 'Nível baixo de esgotamento relacionado ao trabalho.',
    moderate: 'Sinais de esgotamento profissional em nível moderado — atenção aos limites entre trabalho e vida pessoal é importante agora.',
    severe: 'Sinais de esgotamento profissional em nível elevado, o que costuma pedir apoio profissional e, muitas vezes, mudanças no ambiente de trabalho.',
  },
  mdq: {
    minimal: 'Rastreio negativo — isso não descarta completamente quadros bipolares mais sutis, especialmente o tipo II.',
    severe: 'Rastreio positivo — isso aumenta a probabilidade de um quadro do espectro bipolar, mas não é um diagnóstico; a confirmação exige avaliação psiquiátrica formal.',
  },
  pss10: {
    minimal: 'Nível baixo de estresse percebido nas últimas semanas.',
    moderate: 'Nível moderado de estresse percebido — vale observar quais situações estão pesando mais.',
    severe: 'Nível alto de estresse percebido, que pode se beneficiar de apoio para desenvolver estratégias de manejo.',
  },
  pgsi: {
    minimal: 'Sem problemas com jogo identificados neste rastreio.',
    mild: 'Nível baixo de risco, com poucas ou nenhuma consequência negativa identificada.',
    moderate: 'Nível moderado de risco, já associado a algumas consequências negativas.',
    severe: 'Padrão de jogo problemático, com consequências negativas e possível perda de controle — buscar apoio especializado é recomendado.',
  },
  audit: {
    minimal: 'Consumo de álcool classificado como baixo risco.',
    mild: 'Consumo de risco — uma orientação simples sobre redução já costuma fazer diferença.',
    moderate: 'Uso nocivo de álcool identificado — uma avaliação profissional é recomendada.',
    severe: 'Padrão compatível com dependência provável — o recomendado é buscar avaliação e tratamento especializado.',
  },
  iat: {
    minimal: 'Uso da internet dentro do que se considera comum, sem indicativo de dependência.',
    moderate: 'A internet já está causando problemas perceptíveis na sua vida — vale considerar estabelecer limites.',
    severe: 'Padrão de uso compatível com dependência de internet — uma avaliação profissional é recomendada.',
  },
  whoqolbref: {
    minimal: 'Qualidade de vida percebida como muito boa nos aspectos avaliados.',
    mild: 'Boa qualidade de vida percebida, com espaço para melhorias pontuais.',
    moderate: 'Qualidade de vida percebida como moderada — pode valer a pena olhar com mais atenção para as áreas que pesaram mais no resultado.',
    severe: 'Qualidade de vida percebida como baixa — uma conversa com um profissional pode ajudar a entender melhor o que está pesando mais.',
  },
};

function textoEscala(id, classe) {
  return ESCALA_TEXTOS[id]?.[classe] || '';
}

/* ── Catálogo de sugestões pro e-mail ──
   O e-mail nunca revela o tema/resultado do teste feito — só sugere 3
   outros aleatórios (excluindo o identificador recém-concluído). Vai
   crescendo conforme novos rastreios/testes de desempenho entram no ar. ── */
const CATALOGO_SUGESTOES = [
  { identificador: 'depressao', nome: 'Depressão', beneficio: 'Perceba os sinais do seu estado emocional' },
  { identificador: 'ansiedade', nome: 'Ansiedade', beneficio: 'Como a ansiedade pesa no seu dia a dia' },
  { identificador: 'tdah', nome: 'TDAH', beneficio: 'Rastreie sinais de desatenção e hiperatividade' },
  { identificador: 'tea', nome: 'TEA / Autismo', beneficio: 'Identifique traços do espectro autista' },
  { identificador: 'trauma', nome: 'Trauma / TEPT', beneficio: 'Avalie sinais de estresse pós-traumático' },
  { identificador: 'insonia', nome: 'Insônia', beneficio: 'Descubra a qualidade do seu sono' },
  { identificador: 'burnout', nome: 'Burnout', beneficio: 'Como está sua energia no trabalho' },
  { identificador: 'bipolaridade', nome: 'Bipolaridade', beneficio: 'Rastreie sinais de humor bipolar' },
  { identificador: 'estresse', nome: 'Estresse', beneficio: 'Avalie seu nível de estresse' },
  { identificador: 'vicios', nome: 'Vícios & Compulsões', beneficio: 'Entenda seus padrões de uso e controle' },
  { identificador: 'qualidade', nome: 'Qualidade de Vida', beneficio: 'Como está sua qualidade de vida hoje' },
];

function sugestoesAleatorias(identificadorAtual, quantidade = 3) {
  const pool = CATALOGO_SUGESTOES.filter(s => s.identificador !== identificadorAtual);
  const embaralhado = pool.sort(() => Math.random() - 0.5);
  return embaralhado.slice(0, quantidade);
}

function gerarHTML(dados) {
  const { nome, identificador } = dados;
  const sugestoes = sugestoesAleatorias(identificador, 3);

  const sugestoesHTML = sugestoes.map(s => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #eee;">
        <a href="https://oseupsico.com.br/testes/cadastro.html?tema=${s.identificador}" style="text-decoration:none;color:#1A1A1A;">
          🧠 <strong>${s.nome}</strong> — <span style="color:#555;">${s.beneficio}</span>
        </a>
      </td>
    </tr>
  `).join('');

  const waMsg = encodeURIComponent('Olá! Fiz um teste no O Seu Psico e gostaria de conversar com um psicólogo.');
  const waLink = `https://wa.me/${WHATSAPP_NUMERO}?text=${waMsg}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1A1A1A;padding:32px;text-align:center;">
            <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
              O Seu <span style="color:#F5C518;">Psico</span>
            </div>
            <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;text-transform:uppercase;letter-spacing:2px;">Testes</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 24px;">
            <p style="font-size:14px;color:#888;margin:0 0 8px;">Olá, <strong style="color:#1A1A1A;">${nome}</strong> 👋</p>
            <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 20px;">
              Você concluiu um teste em nossa plataforma — e isso já é um passo importante rumo ao autoconhecimento. Esperamos que essas informações te ajudem a entender um pouco mais sobre você mesmo(a), do seu jeito e no seu tempo.
            </p>
            <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 28px;">
              Cuidar da saúde mental é um processo contínuo, e um teste sozinho é só o começo da conversa. Se quiser ir além do que descobriu hoje, temos psicólogos prontos pra te acompanhar nessa jornada — sempre que fizer sentido pra você.
            </p>

            <p style="font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Separamos mais alguns testes que podem te interessar</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              ${sugestoesHTML}
            </table>

            <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 20px;">
              Caso queira falar com um psicólogo, saiba que sempre pode contar conosco.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:#25D366;border-radius:40px;padding:14px 28px;">
                  <a href="${waLink}" style="font-size:15px;font-weight:700;color:#fff;text-decoration:none;">💬 Falar com um psicólogo no WhatsApp →</a>
                </td>
              </tr>
            </table>

            <!-- Disclaimer -->
            <div style="background:#FFF8DC;border-radius:10px;padding:16px 20px;">
              <p style="font-size:13px;color:#7a6200;margin:0;line-height:1.6;">
                ⚠️ Os resultados não substituem a avaliação de um profissional de saúde mental.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f5;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="font-size:12px;color:#aaa;margin:0 0 4px;">O Seu Psico · oseupsico.com.br/testes</p>
            <p style="font-size:11px;color:#ccc;margin:0;">Você recebeu este e-mail porque realizou um teste em nossa plataforma.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function enviarEmail(env, para, nome, dadosEmail) {
  const html = gerarHTML({ nome, ...dadosEmail });
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'O Seu Psico Testes <testes@oseupsico.com.br>',
      to: [para],
      subject: `Seus resultados estão prontos · O Seu Psico`,
      html,
    }),
  });
  return res.ok;
}

/* ── Inicializa tabelas D1 ──
   Schema unificado (rastreios + testes de desempenho + baterias + IGT).
   Em produção a tabela já existe com o schema antigo — a migração das
   colunas novas é feita uma única vez via script separado, não aqui
   (CREATE TABLE IF NOT EXISTS não altera tabela já existente). ── */
async function initDB(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS participantes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      telefone TEXT,
      idade INTEGER,
      tipo TEXT NOT NULL,
      identificador TEXT NOT NULL,
      faixa_geral TEXT,
      resultados TEXT NOT NULL,
      consentimento_dados_em TEXT,
      consentimento_instrumento_em TEXT,
      criado_em TEXT DEFAULT (datetime('now'))
    )`
  ).run();
}

function autenticado(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '');
  let tokenDecodificado = '';
  try { tokenDecodificado = atob(token); } catch {}
  return !!token && tokenDecodificado.includes(env.ADMIN_PASS);
}

/* ── Handler principal ──
   Este Worker é servido sob o prefixo /testes (oseupsico.com.br/testes/*).
   Removemos o prefixo do pathname logo no início para que todo o resto da
   lógica (comparações de rota e busca de assets estáticos) continue igual,
   sem precisar reescrever cada comparação abaixo. ── */
const PREFIX = '/testes';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Sem a barra final, os caminhos relativos do HTML (css/style.css,
    // assets/logo.png etc.) resolveriam para fora de /testes. Redireciona
    // /testes -> /testes/ antes de qualquer outra coisa.
    if (url.pathname === PREFIX) {
      return Response.redirect(`${url.origin}${PREFIX}/${url.search}`, 301);
    }

    const pathname = url.pathname.startsWith(PREFIX)
      ? (url.pathname.slice(PREFIX.length) || '/')
      : url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    /* ── OAuth Decap CMS ── */
    if (pathname === '/auth') {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        scope: 'repo,user',
        redirect_uri: `${url.origin}${PREFIX}/callback`,
      });
      return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
    }

    if (pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Código OAuth ausente.', { status: 400 });
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
      });
      const tokenData = await tokenRes.json();
      const { access_token, error, error_description } = tokenData;
      if (error || !access_token) {
        return new Response(`Erro ao obter token: ${error || 'sem access_token'} — ${error_description || JSON.stringify(tokenData)}`, { status: 500 });
      }
      const content = JSON.stringify({ token: access_token, provider: 'github' });
      const html = `<!DOCTYPE html><html><body><script>
        (function(){
          if (!window.opener) { document.body.textContent = 'Autenticado. Pode fechar esta janela.'; return; }
          // Protocolo oficial do Decap CMS: o pop-up avisa que está
          // autorizando, espera a janela principal responder, e só então
          // envia o token de fato.
          function receiveMessage(e){
            window.opener.postMessage('authorization:github:success:${content.replace(/'/g,"\\'")}', e.origin);
            window.close();
          }
          window.addEventListener('message', receiveMessage, false);
          window.opener.postMessage('authorizing:github', '*');
        })();
      </script></body></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    /* ── API: salvar resultado ──
       tipo: 'rastreio' | 'desempenho' | 'bateria'
       identificador: tema (rastreio) | instrumento (desempenho) | id da bateria
       Os dois consentimentos são obrigatórios — validados aqui, não só no
       cliente, para que a marcação dos checkboxes não possa ser burlada. ── */
    if (pathname === '/api/resultado' && request.method === 'POST') {
      try {
        const body = await request.json();
        const {
          nome, email, telefone, idade,
          tipo, identificador, resultados, faixaGeral,
          consentimentoDados, consentimentoInstrumento,
        } = body;

        if (!consentimentoDados || !consentimentoInstrumento) {
          return json({ ok: false, error: 'Consentimento obrigatório não informado.' }, 400);
        }
        if (!tipo || !identificador || !nome || !email) {
          return json({ ok: false, error: 'Dados obrigatórios ausentes.' }, 400);
        }

        const agora = new Date().toISOString();

        await initDB(env.DB);
        await env.DB.prepare(
          `INSERT INTO participantes
           (nome, email, telefone, idade, tipo, identificador, faixa_geral, resultados, consentimento_dados_em, consentimento_instrumento_em)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          nome, email, telefone || null, idade || null,
          tipo, identificador, faixaGeral || null, JSON.stringify(resultados),
          agora, agora
        ).run();

        await enviarEmail(env, email, nome, { identificador });

        return json({ ok: true });
      } catch (e) {
        return json({ ok: false, error: e.message }, 500);
      }
    }

    /* ── API: login admin ── */
    if (pathname === '/api/admin/login' && request.method === 'POST') {
      const { usuario, senha } = await request.json();
      if (usuario === env.ADMIN_USER && senha === env.ADMIN_PASS) {
        const token = btoa(`${usuario}:${Date.now()}:${env.ADMIN_PASS}`);
        return json({ ok: true, token });
      }
      return json({ ok: false }, 401);
    }

    /* ── API: dados admin (protegido) ──
       Aceita filtro opcional por intervalo de datas via querystring
       (?de=YYYY-MM-DD&ate=YYYY-MM-DD), usado pelo filtro do painel. ── */
    if (pathname === '/api/admin/dados' && request.method === 'GET') {
      if (!autenticado(request, env)) return json({ ok: false }, 401);

      await initDB(env.DB);
      const de = url.searchParams.get('de');
      const ate = url.searchParams.get('ate');

      let query = 'SELECT * FROM participantes';
      const binds = [];
      if (de && ate) {
        query += ' WHERE date(criado_em) BETWEEN ? AND ?';
        binds.push(de, ate);
      } else if (de) {
        query += ' WHERE date(criado_em) >= ?';
        binds.push(de);
      } else if (ate) {
        query += ' WHERE date(criado_em) <= ?';
        binds.push(ate);
      }
      query += ' ORDER BY criado_em DESC LIMIT 500';

      const { results } = await env.DB.prepare(query).bind(...binds).all();

      return json({ ok: true, registros: results });
    }

    /* ── API: excluir registro individual (protegido) ── */
    if (pathname.startsWith('/api/admin/dados/') && request.method === 'DELETE') {
      if (!autenticado(request, env)) return json({ ok: false }, 401);
      const id = pathname.split('/').pop();
      if (!id || !/^\d+$/.test(id)) return json({ ok: false, error: 'ID inválido.' }, 400);

      await initDB(env.DB);
      await env.DB.prepare('DELETE FROM participantes WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }

    /* ── API: excluir registros em lote (protegido) ── */
    if (pathname === '/api/admin/dados/excluir-lote' && request.method === 'POST') {
      if (!autenticado(request, env)) return json({ ok: false }, 401);
      const { ids } = await request.json();
      if (!Array.isArray(ids) || !ids.length || !ids.every(i => Number.isInteger(i))) {
        return json({ ok: false, error: 'Lista de IDs inválida.' }, 400);
      }

      await initDB(env.DB);
      const placeholders = ids.map(() => '?').join(',');
      await env.DB.prepare(`DELETE FROM participantes WHERE id IN (${placeholders})`).bind(...ids).run();
      return json({ ok: true, excluidos: ids.length });
    }

    /* ── API: autoatendimento de exclusão de dados (público, LGPD art. 18) ──
       A pessoa confirma e-mail + telefone; se baterem com algum registro,
       todos os registros correspondentes são apagados imediatamente. ── */
    if (pathname === '/api/exclusao-solicitada' && request.method === 'POST') {
      try {
        const { email, telefone } = await request.json();
        if (!email || !telefone) {
          return json({ ok: false, error: 'Informe e-mail e telefone.' }, 400);
        }

        await initDB(env.DB);
        const { meta } = await env.DB.prepare(
          'DELETE FROM participantes WHERE email = ? AND telefone = ?'
        ).bind(email, telefone).run();

        // Resposta genérica independente de ter encontrado ou não —
        // evita confirmar/negar se um e-mail existe na base.
        return json({ ok: true });
      } catch (e) {
        return json({ ok: false, error: e.message }, 500);
      }
    }

    // Serve assets estáticos usando o pathname sem o prefixo /testes,
    // já que os arquivos vivem na raiz do diretório de assets do projeto.
    const assetUrl = new URL(request.url);
    assetUrl.pathname = pathname;
    const assetRes = await env.ASSETS.fetch(new Request(assetUrl, request));

    // O Cloudflare Assets pode responder com um redirect próprio (ex.: de
    // "/cadastro.html" para "/cadastro"). Como o pathname usado nessa busca
    // já estava sem o prefixo, o Location gerado também vem sem o prefixo —
    // precisamos devolvê-lo para não mandar o usuário pra fora de /testes.
    if (assetRes.status >= 300 && assetRes.status < 400) {
      const location = assetRes.headers.get('Location');
      if (location && location.startsWith('/') && !location.startsWith(PREFIX)) {
        const headers = new Headers(assetRes.headers);
        headers.set('Location', PREFIX + location);
        return new Response(assetRes.body, { status: assetRes.status, headers });
      }
    }

    return assetRes;
  },

  /* ── Job agendado: retenção de 5 anos ──
     Roda periodicamente (ver crons em wrangler.jsonc) e apaga registros
     com mais de 5 anos, conforme a Política de Privacidade. ── */
  async scheduled(event, env, ctx) {
    await initDB(env.DB);
    await env.DB.prepare(
      `DELETE FROM participantes WHERE criado_em < datetime('now', '-5 years')`
    ).run();
  },
};
