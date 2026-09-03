import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminRecord } from './_db';

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const admin = await getAdminRecord();

    if (admin && admin.exists && admin.senhaHash) {
      return res.status(200).json({
        exists: true,
        isConfigured: true,
        email: admin.email,
        nome: admin.nome,
        telefone: admin.telefone,
        twoFactorEnabled: admin.twoFactorEnabled,
        twoFactorChannel: admin.twoFactorChannel,
      });
    }

    return res.status(200).json({
      exists: false,
      isConfigured: false,
      email: '',
      nome: 'Tamara Produções (Administrador)',
      telefone: '(85) 99867-2404',
      twoFactorEnabled: false,
      twoFactorChannel: 'email',
    });
  } catch (err: any) {
    return res.status(200).json({
      exists: false,
      isConfigured: false,
      error: err.message,
    });
  }
}
