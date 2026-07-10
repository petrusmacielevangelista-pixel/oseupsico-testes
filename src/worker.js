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

/* ── Templates de e-mail por faixa ── */
const EMAIL_TEMPLATES = {
  minimal: {
    titulo: 'Seus indicadores estão dentro do esperado 🌱',
    mensagem: 'Ótima notícia! Seus resultados de rastreio não indicam sintomas significativos no momento. Isso não significa que você não possa se beneficiar de apoio psicológico — muitas pessoas buscam psicoterapia para autoconhecimento e desenvolvimento pessoal.',
    cta_label: 'Conhecer nossos psicólogos',
    cor: '#22C55E',
  },
  mild: {
    titulo: 'Seus resultados merecem atenção 💛',
    mensagem: 'Identificamos alguns indicadores que valem uma conversa com um profissional. Sintomas leves, quando acompanhados cedo, têm excelente resposta ao tratamento.',
    cta_label: 'Encontrar meu psicólogo',
    cor: '#EAB308',
  },
  moderate: {
    titulo: 'Recomendamos buscar apoio profissional 🧡',
    mensagem: 'Seus resultados indicam sintomas moderados que se beneficiariam de avaliação e acompanhamento por um psicólogo. Você não precisa passar por isso sozinho(a).',
    cta_label: 'Falar com um psicólogo agora',
    cor: '#F97316',
  },
  severe: {
    titulo: 'Seus resultados pedem atenção urgente ❤️',
    mensagem: 'Identificamos indicadores que sugerem sintomas significativos. É importante buscar apoio profissional o quanto antes. Nossos psicólogos estão disponíveis para uma primeira conversa ainda hoje.',
    cta_label: 'Falar com psicólogo hoje',
    cor: '#EF4444',
  },
};

function gerarHTML(dados) {
  const { nome, tema, resultados, faixaGeral } = dados;
  const tmpl = EMAIL_TEMPLATES[faixaGeral] || EMAIL_TEMPLATES.minimal;

  const temaLabel = {
    depressao: 'Depressão', ansiedade: 'Ansiedade', tdah: 'TDAH',
    tea: 'TEA / Autismo', trauma: 'Trauma / TEPT', insonia: 'Insônia',
    burnout: 'Burnout', bipolaridade: 'Bipolaridade', estresse: 'Estresse',
    vicios: 'Vícios & Compulsões', qualidade: 'Qualidade de Vida',
  }[tema] || tema;

  const faixaLabel = { minimal: 'Mínima', mild: 'Leve', moderate: 'Moderada', severe: 'Grave' };

  const escalasRows = Object.entries(resultados).map(([id, res]) => `
    <tr>
      <td style="padding:12px 16px;font-size:14px;color:#444;border-bottom:1px solid #eee;">${id.toUpperCase()}</td>
      <td style="padding:12px 16px;font-size:14px;color:#444;border-bottom:1px solid #eee;text-align:center;">${res.score}/${res.scoreMax}</td>
      <td style="padding:12px 16px;text-align:center;border-bottom:1px solid #eee;">
        <span style="background:${corFaixa(res.classe)};color:#fff;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;">${res.faixa || faixaLabel[res.classe]}</span>
      </td>
    </tr>
  `).join('');

  const escalasTextos = Object.entries(resultados)
    .map(([id, res]) => ({ nome: id.toUpperCase(), texto: textoEscala(id, res.classe) }))
    .filter(e => e.texto)
    .map(e => `
      <div style="margin-bottom:12px;">
        <strong style="font-size:13px;color:#1A1A1A;">${e.nome}:</strong>
        <span style="font-size:13px;color:#555;line-height:1.6;">${e.texto}</span>
      </div>
    `).join('');

  const waMsg = encodeURIComponent(`Olá! Acabei de fazer o rastreio de ${temaLabel} no O Seu Psico e gostaria de conversar com um psicólogo.`);
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
            <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;text-transform:uppercase;letter-spacing:2px;">Testes · Rastreio em Saúde Mental</div>
          </td>
        </tr>

        <!-- Faixa colorida -->
        <tr><td style="height:6px;background:${tmpl.cor};"></td></tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 24px;">
            <p style="font-size:14px;color:#888;margin:0 0 8px;">Olá, <strong style="color:#1A1A1A;">${nome}</strong> 👋</p>
            <h1 style="font-size:24px;font-weight:800;color:#1A1A1A;margin:0 0 16px;line-height:1.2;">${tmpl.titulo}</h1>
            <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 24px;">${tmpl.mensagem}</p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr>
                <td style="background:#25D366;border-radius:40px;padding:14px 28px;">
                  <a href="${waLink}" style="font-size:15px;font-weight:700;color:#fff;text-decoration:none;">💬 ${tmpl.cta_label} no WhatsApp →</a>
                </td>
              </tr>
            </table>

            <!-- Tabela de resultados -->
            <div style="background:#fafafa;border-radius:12px;overflow:hidden;border:1px solid #eee;margin-bottom:24px;">
              <div style="background:#1A1A1A;padding:14px 16px;font-size:12px;font-weight:700;color:#F5C518;text-transform:uppercase;letter-spacing:1px;">
                Rastreio de ${temaLabel}
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="padding:10px 16px;font-size:11px;font-weight:700;color:#888;text-align:left;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #eee;">Escala</th>
                    <th style="padding:10px 16px;font-size:11px;font-weight:700;color:#888;text-align:center;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #eee;">Pontuação</th>
                    <th style="padding:10px 16px;font-size:11px;font-weight:700;color:#888;text-align:center;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #eee;">Faixa</th>
                  </tr>
                </thead>
                <tbody>${escalasRows}</tbody>
              </table>
            </div>

            ${escalasTextos ? `
            <!-- O que os resultados significam -->
            <div style="background:#fafafa;border-radius:12px;padding:20px 24px;border:1px solid #eee;margin-bottom:24px;">
              <div style="font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">O que os seus resultados significam</div>
              ${escalasTextos}
            </div>
            ` : ''}

            <!-- Disclaimer -->
            <div style="background:#FFF8DC;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
              <p style="font-size:13px;color:#7a6200;margin:0;line-height:1.6;">
                ⚠️ <strong>Importante:</strong> Estes instrumentos são de <strong>rastreio</strong>, não de diagnóstico. Os resultados não substituem a avaliação de um profissional de saúde mental.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f5;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="font-size:12px;color:#aaa;margin:0 0 4px;">O Seu Psico · testes.oseupsico.com.br</p>
            <p style="font-size:11px;color:#ccc;margin:0;">Você recebeu este e-mail porque realizou um teste em nossa plataforma.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function corFaixa(classe) {
  return { minimal: '#22C55E', mild: '#EAB308', moderate: '#F97316', severe: '#EF4444' }[classe] || '#888';
}

async function enviarEmail(env, para, nome, dadosEmail) {
  const html = gerarHTML(dadosEmail);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'O Seu Psico Testes <testes@oseupsico.com.br>',
      to: [para],
      subject: `Seus resultados de rastreio · O Seu Psico`,
      html,
    }),
  });
  return res.ok;
}

/* ── Inicializa tabelas D1 ── */
async function initDB(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS participantes (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT NOT NULL, telefone TEXT NOT NULL, idade INTEGER NOT NULL, tema TEXT NOT NULL, faixa_geral TEXT NOT NULL, resultados TEXT NOT NULL, criado_em TEXT DEFAULT (datetime('now')))`
  ).run();
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

    /* ── API: salvar resultado ── */
    if (pathname === '/api/resultado' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { nome, email, telefone, idade, tema, resultados, faixaGeral } = body;

        await initDB(env.DB);
        await env.DB.prepare(
          `INSERT INTO participantes (nome, email, telefone, idade, tema, faixa_geral, resultados)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(nome, email, telefone, idade, tema, faixaGeral, JSON.stringify(resultados)).run();

        await enviarEmail(env, email, nome, { nome, tema, resultados, faixaGeral });

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

    /* ── API: dados admin (protegido) ── */
    if (pathname === '/api/admin/dados' && request.method === 'GET') {
      const auth = request.headers.get('Authorization') || '';
      const token = auth.replace('Bearer ', '');
      if (!token || !token.includes(env.ADMIN_PASS)) {
        return json({ ok: false }, 401);
      }

      await initDB(env.DB);
      const { results } = await env.DB.prepare(
        `SELECT * FROM participantes ORDER BY criado_em DESC LIMIT 500`
      ).all();

      return json({ ok: true, registros: results });
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
};
