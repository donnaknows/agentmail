#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');

const API_BASE = 'https://api.agentmail.to/v0';

function usage() {
  console.log(`AgentMail CLI

Usage:
  agentmail.js <command> [options]

Commands:
  inboxes:list
  messages:list --inbox <inbox_id> [--labels <csv>] [--limit <n>]
  message:send --inbox <inbox_id> --to <csv> [--cc <csv>] [--bcc <csv>] --subject <text> (--text <text> | --text-file <path>)
  message:reply --inbox <inbox_id> --message <message_id> (--text <text> | --text-file <path>)
  message:mark-read --inbox <inbox_id> --message <message_id>
  thread:delete --inbox <inbox_id> --thread <thread_id>

Options:
  --raw                Print raw API JSON
  -h, --help           Show help
`);
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      if (k === 'raw' || k === 'help') out[k] = true;
      else out[k] = argv[++i];
    } else if (a === '-h') {
      out.help = true;
    } else {
      out._.push(a);
    }
  }
  return out;
}

function loadApiKey() {
  if (process.env.AGENTMAIL_API_KEY) return process.env.AGENTMAIL_API_KEY;
  const cfgPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
  if (!fs.existsSync(cfgPath)) return '';
  try {
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    return cfg?.skills?.entries?.agentmail?.env?.AGENTMAIL_API_KEY || cfg?.env?.vars?.AGENTMAIL_API_KEY || '';
  } catch {
    return '';
  }
}

function readText(args) {
  if (args['text-file']) return fs.readFileSync(args['text-file'], 'utf8');
  if (args.text) return args.text;
  return '';
}

async function request(urlPath, { method = 'GET', body } = {}) {
  const key = loadApiKey();
  if (!key) throw new Error('missing AGENTMAIL_API_KEY');

  const res = await fetch(`${API_BASE}${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${typeof json === 'object' ? JSON.stringify(json) : text}`);
  }
  return json;
}

function required(args, fields) {
  for (const f of fields) {
    if (!args[f]) throw new Error(`missing --${f}`);
  }
}

(async () => {
  try {
    const args = parseArgs(process.argv);
    if (args.help || args._.length === 0) {
      usage();
      process.exit(0);
    }

    const cmd = args._[0];
    let out;

    if (cmd === 'inboxes:list') {
      out = await request('/inboxes');
    } else if (cmd === 'messages:list') {
      required(args, ['inbox']);
      const qp = new URLSearchParams();
      if (args.labels) qp.set('labels', args.labels);
      if (args.limit) qp.set('limit', String(args.limit));
      out = await request(`/inboxes/${encodeURIComponent(args.inbox)}/messages${qp.toString() ? '?' + qp.toString() : ''}`);
    } else if (cmd === 'message:send') {
      required(args, ['inbox', 'to', 'subject']);
      const text = readText(args).trim();
      if (!text) throw new Error('missing --text or --text-file');
      const to = args.to.split(',').map(s => s.trim()).filter(Boolean);
      const body = { to, subject: args.subject, text };
      if (args.cc) body.cc = args.cc.split(',').map(s => s.trim()).filter(Boolean);
      if (args.bcc) body.bcc = args.bcc.split(',').map(s => s.trim()).filter(Boolean);
      out = await request(`/inboxes/${encodeURIComponent(args.inbox)}/messages/send`, {
        method: 'POST',
        body
      });
    } else if (cmd === 'message:reply') {
      required(args, ['inbox', 'message']);
      const text = readText(args).trim();
      if (!text) throw new Error('missing --text or --text-file');
      out = await request(`/inboxes/${encodeURIComponent(args.inbox)}/messages/${encodeURIComponent(args.message)}/reply`, {
        method: 'POST',
        body: { text }
      });
    } else if (cmd === 'message:mark-read') {
      required(args, ['inbox', 'message']);
      out = await request(`/inboxes/${encodeURIComponent(args.inbox)}/messages/${encodeURIComponent(args.message)}`, {
        method: 'PATCH',
        body: { remove_labels: ['unread'], add_labels: ['read'] }
      });
    } else if (cmd === 'thread:delete') {
      required(args, ['inbox', 'thread']);
      out = await request(`/inboxes/${encodeURIComponent(args.inbox)}/threads/${encodeURIComponent(args.thread)}`, {
        method: 'DELETE'
      });
      out = { ok: true, message: 'thread deleted', thread_id: args.thread };
    } else {
      throw new Error(`unknown command: ${cmd}`);
    }

    if (args.raw) {
      console.log(JSON.stringify(out, null, 2));
    } else {
      console.log(JSON.stringify(out));
    }
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    process.exit(1);
  }
})();
