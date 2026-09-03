import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminRecord, sha256, cleanEmail, cleanInput } from './_db';

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

  const { email, password, senha } = req.body || {};
  const inputEmail = cleanEmail(email);
  const inputSenha = cleanInput(password || senha);

  if (!inputEmail || !inputSenha) {
    return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const admin = await getAdminRecord();

    if (!admin || !admin.exists || !admin.senhaHash) {
      return res.status(200).json({
        success: false,
        requiresSetup: true,
        message: 'Nenhum administrador configurado no sistema. Por favor, realize o Primeiro Acesso.',
      });
    }

    const adminEmail = cleanEmail(admin.email);
    const hashDigitado = sha256(inputSenha);

    const isEmailValido =
      inputEmail === adminEmail ||
      inputEmail === 'admin' ||
      inputEmail === 'tamara';

    const isSenhaValida = hashDigitado === admin.senhaHash;

    if (!isEmailValido || !isSenhaValida) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou senha incorretos.',
      });
    }

    const token = `token_admin_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return res.status(200).json({
      success: true,
      requires2FA: admin.twoFactorEnabled,
      token,
      user: {
        id: 'admin-master',
        nome: admin.nome || 'Tamara Produções (Administrador)',
        email: admin.email,
        telefone: admin.telefone || '(85) 99867-2404',
        role: 'admin',
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao validar login: ' + (err.message || ''),
    });
  }
}
