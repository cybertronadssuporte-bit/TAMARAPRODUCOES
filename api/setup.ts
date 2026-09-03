import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

function sha256(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function cleanInput(val: string): string {
  if (!val) return '';
  return val
    .replace(/[\u200B-\u200D\uFEFF\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/[\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000]/g, ' ')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .trim();
}

function cleanEmail(val: string): string {
  return cleanInput(val).toLowerCase().replace(/\s+/g, '').trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { nome, email, senha, telefone } = req.body || {};

  const cleanNomeVal = cleanInput(nome) || 'Tamara Produções (Administrador)';
  const cleanEmailVal = cleanEmail(email);
  const cleanSenhaVal = cleanInput(senha);
  const cleanTelVal = cleanInput(telefone) || '(85) 99867-2404';

  if (!cleanEmailVal || !cleanSenhaVal) {
    return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
  }

  if (cleanSenhaVal.length < 8) {
    return res.status(400).json({ success: false, message: 'A senha deve ter no mínimo 8 caracteres.' });
  }

  const hash = sha256(cleanSenhaVal);

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('seu-projeto.supabase.co')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Tentar RPC segura
      const { data: rpcData, error: rpcErr } = await supabase.rpc('setup_first_admin_secure', {
        p_nome: cleanNomeVal,
        p_email: cleanEmailVal,
        p_senha_hash: hash,
        p_telefone: cleanTelVal,
      });

      if (!rpcErr && rpcData && rpcData.success) {
        return res.status(200).json({ success: true, message: 'Administrador configurado com sucesso na nuvem!' });
      }

      // 2. Fallback: Update direto na tabela empresa
      await supabase
        .from('empresa')
        .update({
          admin_nome: cleanNomeVal,
          admin_email: cleanEmailVal,
          admin_senha_hash: hash,
          admin_telefone: cleanTelVal,
          admin_configured: true,
          updated_at: new Date().toISOString(),
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      return res.status(200).json({ success: true, message: 'Administrador configurado com sucesso na nuvem!' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Erro ao conectar ao banco: ' + (err.message || '') });
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Administrador configurado com sucesso!',
  });
}
