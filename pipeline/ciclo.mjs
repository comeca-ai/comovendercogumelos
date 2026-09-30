#!/usr/bin/env node
/**
 * Ciclo semanal IA-first. Código no controle, IA nas decisões, humano no portão.
 * Uso: node pipeline/ciclo.mjs [--seco] [--so medir]
 */
import { readFile } from 'node:fs/promises';
import { medir } from './etapas/medir.mjs';
import { descobrir } from './etapas/descobrir.mjs';
import { gerar } from './etapas/gerar.mjs';
import { checar } from './etapas/checar.mjs';
import { publicar } from './etapas/publicar.mjs';
import { reviews } from './etapas/reviews.mjs';
import { social } from './etapas/social.mjs';
import { mencoes } from './etapas/mencoes.mjs';
import { relatorio } from './etapas/relatorio.mjs';
import { custo } from './lib/custo.mjs';
import { carregarFatos } from './lib/fatos.mjs';

const args = process.argv.slice(2);
const seco = args.includes('--seco');
const so = args[args.indexOf('--so') + 1];
const opt = { seco };

const cfg = JSON.parse(await readFile(new URL('../config.json', import.meta.url), 'utf8'));
const perguntas = JSON.parse(await readFile(new URL(`../${cfg.perguntas}`, import.meta.url), 'utf8'));

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

log(`A0 medir: ${perguntas.length} perguntas × ${cfg.motores.length} motores${seco ? ' (seco)' : ''}`);
const medicao = await medir(cfg, perguntas, opt);
log('resumo', JSON.stringify(medicao.resumo));
if (so === 'medir') process.exit(0);

custo.checarTeto(cfg.teto_mensal_usd);

log('A1 descobrir');
const escolhidas = await descobrir(cfg, perguntas, medicao, opt);
log('escolhidas', escolhidas.map((e) => e.texto));

// Fatos vêm da planilha (Google Sheets API). Em seco, um exemplo fixo.
const fatos = await carregarFatos(opt);

const publicadas = [];
const fila = [];
for (const escolha of escolhidas) {
  log('A2 gerar:', escolha.texto);
  const pagina = await gerar(cfg, escolha, fatos, opt);
  log('A3 checar');
  const c = await checar(cfg, pagina, escolha.cluster, opt);
  if (!c.publicar) {
    fila.push(`página "${escolha.texto}": ${c.falhas.join('; ')}`);
    continue;
  }
  const pub = await publicar(cfg, pagina, opt);
  publicadas.push(pub);
  log('publicada', pub.url);
  await social(cfg, pagina, pub.url, opt);
  const m = await mencoes(cfg, pagina, pub.url, cfg.template_pauta_aprovado, opt);
  if (!m.enviar) fila.push(`aprovar e-mail de pauta para "${escolha.texto}"`);
}

log('A4 reviews');
const rv = await reviews(cfg, [], [], opt);
for (const av of rv.fila) fila.push(`responder avaliação: ${av.texto?.slice(0, 60)}`);

const md = await relatorio(cfg, { medicao, publicadas, fila });
console.log('\n' + md);
