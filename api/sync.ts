import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS e headers anti-cache
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Se o Supabase estiver configurado com credenciais
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('seu-projeto.supabase.co')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Tenta consultar via RPC segura primeiro
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_sync_data');
      if (!rpcError && rpcData) {
        return res.status(200).json(rpcData);
      }

      // Fallback para query direta na tabela empresa
      const { data: empresaData, error: empError } = await supabase
        .from('empresa')
        .select('admin_email, admin_senha_hash, two_factor_enabled, two_factor_channel, admin_nome, admin_telefone')
        .limit(1)
        .maybeSingle();

      if (!empError && empresaData && empresaData.admin_senha_hash) {
        return res.status(200).json({
          admin_email: empresaData.admin_email || 'admin@tamaraproducoes.com.br',
          admin_senha_hash: empresaData.admin_senha_hash,
          two_factor_enabled: empresaData.two_factor_enabled || false,
          two_factor_channel: empresaData.two_factor_channel || 'email',
          admin_nome: empresaData.admin_nome || 'Tamara Produções (Administrador)',
          admin_telefone: empresaData.admin_telefone || '(85) 99867-2404',
        });
      }
    } catch {
      // Retorna defaults se houver falha de rede com o banco
    }
  }

  // Se o banco de dados não estiver configurado ou em fallback
  return res.status(200).json({
    admin_email: 'admin@tamaraproducoes.com.br',
    admin_senha_hash: 'f6ea3aa2062233d774ca9cc608b28c3dfa3947709c01e339425aced3e33c7f18',
    two_factor_enabled: false,
    two_factor_channel: 'email',
    admin_nome: 'Tamara Produções (Administrador)',
    admin_telefone: '(85) 99867-2404',
  });
}
