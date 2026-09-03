import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminRecord, saveAdminRecord, sha256, cleanInput } from './_db';

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

  const { senhaAtual, novaSenha } = req.body || {};

  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ success: false, message: 'Senha atual e nova senha são obrigatórias.' });
  }

  const cleanSenhaAtual = cleanInput(senhaAtual);
  const cleanNovaSenha = cleanInput(novaSenha);

  if (cleanNovaSenha.length < 8) {
    return res.status(400).json({ success: false, message: 'A nova senha deve ter no mínimo 8 caracteres.' });
  }

  try {
    const admin = await getAdminRecord();

    if (!admin || !admin.exists || !admin.senhaHash) {
      return res.status(404).json({ success: false, message: 'Administrador não encontrado.' });
    }

    const hashAtual = sha256(cleanSenhaAtual);
    if (hashAtual !== admin.senhaHash) {
      return res.status(401).json({ success: false, message: 'A senha atual informada está incorreta.' });
    }

    const novoHash = sha256(cleanNovaSenha);
    admin.senhaHash = novoHash;
    admin.updatedAt = new Date().toISOString();

    await saveAdminRecord(admin);

    return res.status(200).json({
      success: true,
      message: 'Senha alterada e sincronizada globalmente com sucesso!',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao alterar senha: ' + (err.message || ''),
    });
  }
}
