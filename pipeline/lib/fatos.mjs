/**
 * Fatos: preço, custo e rendimento vêm da planilha da Micélio & Cia (Google Sheets API).
 * O gerador recebe esses números prontos; número que não passou por aqui não entra no site.
 * Requer: GOOGLE_SHEETS_ID + GOOGLE_SERVICE_ACCOUNT_JSON no .env.
 */
import { custo } from './custo.mjs';

const ESCOPO_PADRAO = 'https://www.googleapis.com/auth/spreadsheets.readonly';

export async function tokenJwt(escopo = ESCOPO_PADRAO) {
  const sa = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const jwt = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: sa.client_email, scope: escopo, aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now })}`;
  const crypto = await import('node:crypto');
  const ass = crypto.createSign('RSA-SHA256').update(jwt).sign(sa.private_key);
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${jwt}.${ass.toString('base64url')}` }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`sheets auth: ${j.error_description || j.error}`);
  return j.access_token;
}

/** Lê a aba "fatos" (colunas: valor, fonte, data, cluster). Em seco, usa o exemplo fixo. */
export async function carregarFatos({ seco }) {
  if (seco || !process.env.GOOGLE_SHEETS_ID) {
    return [
      { valor: 'shiitake R$ 38/kg no atacado', fonte: 'CEAGESP', data: 'semana 39/2026', cluster: 'preco' },
      { valor: 'bloco inoculado R$ 7 a 10', fonte: 'planilha Micélio & Cia', data: 'set/2026', cluster: 'comecar' },
    ];
  }
  const token = await tokenJwt();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/fatos!A:D`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const j = await r.json();
  if (!r.ok) throw new Error(`sheets: ${j.error?.message || r.status}`);
  custo.registrarFixo('sheets', 0);
  const [head, ...linhas] = j.values || [];
  return linhas.filter((l) => l[0]).map((l) => ({ valor: l[0], fonte: l[1] || '?', data: l[2] || '?', cluster: l[3] || 'geral' }));
}
