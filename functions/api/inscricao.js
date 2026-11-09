// Cloudflare Pages Function. Requer binding D1 "DB" e schema.sql aplicado.
// Não registra IP, não envia e-mails automaticamente e não cobra pagamentos.
const send = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return send({ ok: false, error: 'Origem inválida.' }, 403);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return send({ ok: false, error: 'Formato inválido.' }, 415);
  if (!env.DB) return send({ ok: false, error: 'Cadastro temporariamente indisponível.' }, 503);
  let raw;
  try { raw = await request.text(); } catch { return send({ ok: false, error: 'Solicitação inválida.' }, 400); }
  if (raw.length > 3000) return send({ ok: false, error: 'Dados muito extensos.' }, 413);
  let data;
  try { data = JSON.parse(raw); } catch { return send({ ok: false, error: 'Dados inválidos.' }, 400); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return send({ ok: false, error: 'Dados inválidos.' }, 400);
  // Campo oculto anti-spam; não revela se foi detectado.
  if (data.site) return send({ ok: true });
  const nome = typeof data.nome === 'string' ? data.nome.trim().replace(/\s+/g, ' ') : '';
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const whatsapp = typeof data.whatsapp === 'string' ? data.whatsapp.replace(/\D/g, '') : '';
  const aquario = data.aquario;
  if (nome.length < 2 || nome.length > 80 || !/^[^\s@]{1,64}@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120 || whatsapp.length < 10 || whatsapp.length > 13 || !['doce','marinho','ambos','planejando'].includes(aquario) || data.consentimento !== true) {
    return send({ ok: false, error: 'Verifique os dados e a autorização de contato.' }, 400);
  }
  try {
    await env.DB.prepare(`INSERT INTO interessados (nome, email, whatsapp, aquario, consentimento, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))
      ON CONFLICT(email) DO UPDATE SET
      nome = excluded.nome, whatsapp = excluded.whatsapp, aquario = excluded.aquario,
      consentimento = excluded.consentimento, updated_at = datetime('now')`)
      .bind(nome, email, whatsapp, aquario).run();
    return send({ ok: true });
  } catch (error) {
    console.error('Erro ao armazenar inscrição', error instanceof Error ? error.name : 'unknown');
    return send({ ok: false, error: 'Não foi possível salvar o cadastro neste momento.' }, 500);
  }
}

export function onRequestGet() {
  return send({ ok: false, error: 'Método não permitido.' }, 405);
}