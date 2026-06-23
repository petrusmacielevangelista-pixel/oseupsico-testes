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
        <span style="background:${corFaixa(res.classe)};color:#fff;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;">${faixaLabel[res.classe] || res.faixa}</span>
      </td>
    </tr>
  `).join('');

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
                <td style="background:#F5C518;border-radius:40px;padding:14px 28px;">
                  <a href="https://oseupsico.com.br" style="font-size:15px;font-weight:700;color:#1A1A1A;text-decoration:none;">${tmpl.cta_label} →</a>
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
  await db.exec(`
    CREATE TABLE IF NOT EXISTS participantes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      telefone TEXT NOT NULL,
      idade INTEGER NOT NULL,
      tema TEXT NOT NULL,
      faixa_geral TEXT NOT NULL,
      resultados TEXT NOT NULL,
      criado_em TEXT DEFAULT (datetime('now'))
    );
  `);
}

/* ── Handler principal ── */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    /* ── OAuth Decap CMS ── */
    if (pathname === '/auth') {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        scope: 'repo,user',
        redirect_uri: `${url.origin}/callback`,
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
      const { access_token, error } = await tokenRes.json();
      if (error || !access_token) return new Response('Erro ao obter token.', { status: 500 });
      const content = JSON.stringify({ token: access_token, provider: 'github' });
      const html = `<!DOCTYPE html><html><body><script>
        (function(){
          function cb(e){ window.opener.postMessage('authorization:github:success:${content.replace(/'/g,"\\'")}', e.origin); }
          window.addEventListener('message', cb, false);
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

    return env.ASSETS.fetch(request);
  },
};
