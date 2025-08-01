/**
 * Configuração de Email para o Sistema
 * 
 * Este arquivo contém as configurações e funções para envio de email.
 * Para produção, substitua por um serviço real como Resend, SendGrid, etc.
 */

export interface EmailConfig {
  provider: 'development' | 'resend' | 'sendgrid' | 'nodemailer';
  from: string;
  replyTo?: string;
}

export const emailConfig: EmailConfig = {
  provider: process.env.NODE_ENV === 'production' ? 'resend' : 'development',
  from: process.env.EMAIL_FROM || 'noreply@clinica.com',
  replyTo: process.env.EMAIL_REPLY_TO || 'contato@clinica.com',
};

export interface InviteEmailData {
  to: string;
  doctorName: string;
  inviteLink: string;
  clinicName?: string;
  expiresIn?: string;
}

/**
 * Template de email para convite de médico
 */
export function generateInviteEmailTemplate(data: InviteEmailData): string {
  const { doctorName, inviteLink, clinicName = "Sistema Médico", expiresIn = "7 dias" } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Convite para ${clinicName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background-color: #007bff; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { font-size: 12px; color: #666; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Convite para ${clinicName}</h1>
        </div>
        
        <p>Olá Dr. ${doctorName},</p>
        
        <p>Você foi convidado para acessar nosso sistema de gestão médica. Este convite permitirá que você:</p>
        
        <ul>
          <li>Acesse seu dashboard personalizado</li>
          <li>Visualize e gerencie seus agendamentos</li>
          <li>Atualize suas informações de perfil</li>
          <li>Colabore com a equipe da clínica</li>
        </ul>
        
        <p>Para completar seu registro, clique no botão abaixo:</p>
        
        <p style="text-align: center;">
          <a href="${inviteLink}" class="button">Completar Registro</a>
        </p>
        
        <p><strong>Importante:</strong> Este convite expira em ${expiresIn}. Se você não conseguir acessar o link, entre em contato conosco.</p>
        
        <div class="footer">
          <p>Se você não esperava receber este email, pode ignorá-lo com segurança.</p>
          <p>© ${new Date().getFullYear()} ${clinicName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Função principal para envio de email de convite
 * Adapte esta função para usar seu provedor de email preferido
 */
export async function sendDoctorInviteEmail(data: InviteEmailData): Promise<boolean> {
  const { to, doctorName, inviteLink } = data;
  
  switch (emailConfig.provider) {
    case 'development':
      // Modo desenvolvimento - apenas log no console
      console.log(`
        🚀 EMAIL DE DESENVOLVIMENTO ENVIADO:
        ====================================
        Para: ${to}
        Assunto: Convite para acessar o sistema médico
        
        Dr. ${doctorName}, você foi convidado!
        
        🔗 Link de convite: ${inviteLink}
        
        ⏰ Expira em: 7 dias
        ====================================
      `);
      
      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
      
    case 'resend':
      // TODO: Implementar Resend
      // const { Resend } = require('resend');
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // return await sendWithResend(data);
      throw new Error('Resend não implementado ainda');
      
    case 'sendgrid':
      // TODO: Implementar SendGrid
      throw new Error('SendGrid não implementado ainda');
      
    case 'nodemailer':
      // TODO: Implementar Nodemailer
      throw new Error('Nodemailer não implementado ainda');
      
    default:
      throw new Error(`Provedor de email não suportado: ${emailConfig.provider}`);
  }
}

/**
 * Função de exemplo para implementar Resend em produção
 */
/*
async function sendWithResend(data: InviteEmailData): Promise<boolean> {
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    await resend.emails.send({
      from: emailConfig.from,
      to: data.to,
      subject: 'Convite para acessar o sistema médico',
      html: generateInviteEmailTemplate(data),
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar email com Resend:', error);
    return false;
  }
}
*/
