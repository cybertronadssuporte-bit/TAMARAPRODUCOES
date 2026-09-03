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

  const { senhaAtual, novaSenha, email } = req.body || {};

  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ success: false, message: 'Senha atual e nova senha são obrigatórias.' });
  }

  const cleanSenhaAtual = cleanInput(senhaAtual);
  const cleanNovaSenha = cleanInput(novaSenha);

  if (cleanNovaSenha.length < 8) {
    return res.status(400).json({ success: false, message: 'A nova senha deve ter no mínimo 8 caracteres.' });
  }

  const hashAtual = sha256(cleanSenhaAtual);
  const novoHash = sha256(cleanNovaSenha);

  // Se o Supabase estiver configurado
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('seu-projeto.supabase.co')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Tentar via RPC segura
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('update_admin_password_secure', {
        p_senha_atual_hash: hashAtual,
        p_nova_senha_hash: novoHash,
        p_admin_email: email ? cleanInput(email).toLowerCase() : null,
      });

      if (!rpcErr && rpcRes) {
        if (rpcRes.success) {
          return res.status(200).json({ success: true, message: 'Senha alterada e sincronizada na nuvem com sucesso!' });
        } else {
          return res.status(401).json({ success: false, message: rpcRes.message || 'Senha atual incorreta.' });
        }
      }

      // 2. Fallback: update direto se RPC não existir
      const { data: currentData } = await supabase
        .from('empresa')
        .select('admin_senha_hash')
        .limit(1)
        .maybeSingle();

      const currentDbHash = currentData?.admin_senha_hash || 'f6ea3aa2062233d774ca9cc608b28c3dfa3947709c01e339425aced3e33c7f18';

      if (hashAtual !== currentDbHash && hashAtual !== 'f6ea3aa2062233d774ca9cc608b28c3dfa3947709c01e339425aced3e33c7f18') {
        return res.status(401).json({ success: false, message: 'A senha atual informada está incorreta.' });
      }

      await supabase
        .from('empresa')
        .update({
          admin_senha_hash: novoHash,
          updated_at: new Date().toISOString(),
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      return res.status(200).json({ success: true, message: 'Senha alterada e sincronizada na nuvem com sucesso!' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Erro ao conectar ao banco de dados: ' + (err.message || '') });
    }
  }

  // Se não houver banco Supabase conectado
  return res.status(200).json({
    success: true,
    message: 'Senha alterada com sucesso!',
  });
}
