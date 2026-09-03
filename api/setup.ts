import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminRecord, saveAdminRecord, sha256, cleanEmail, cleanInput } from './_db';

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

  const { nome, email, senha, hash: providedHash, telefone } = req.body || {};

  const cleanNomeVal = cleanInput(nome) || 'Tamara Produções (Administrador)';
  const cleanEmailVal = cleanEmail(email);
  const cleanSenhaVal = cleanInput(senha);
  const cleanTelVal = cleanInput(telefone) || '(85) 99867-2404';

  let hash = providedHash ? cleanInput(providedHash) : '';
  if (!hash && cleanSenhaVal) {
    if (cleanSenhaVal.length < 8) {
      return res.status(400).json({ success: false, message: 'A senha deve ter no mínimo 8 caracteres.' });
    }
    hash = sha256(cleanSenhaVal);
  }

  if (!cleanEmailVal || !hash) {
    return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const existing = await getAdminRecord();

    // Se já existir administrador configurado no banco e não for atualização autorizada
    if (existing && existing.exists && existing.senhaHash && existing.email !== cleanEmailVal) {
      return res.status(400).json({
        success: false,
        message: 'O administrador do site já foi cadastrado anteriormente.',
      });
    }

    // Grava no banco/storage centralizado
    await saveAdminRecord({
      exists: true,
      nome: cleanNomeVal,
      email: cleanEmailVal,
      senhaHash: hash,
      telefone: cleanTelVal,
      twoFactorEnabled: false,
      twoFactorChannel: 'email',
      updatedAt: new Date().toISOString(),
    });

    const token = `token_admin_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return res.status(200).json({
      success: true,
      message: 'Administrador configurado com sucesso no servidor!',
      token,
      user: {
        id: 'admin-master',
        nome: cleanNomeVal,
        email: cleanEmailVal,
        telefone: cleanTelVal,
        role: 'admin',
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao cadastrar administrador: ' + (err.message || ''),
    });
  }
}
