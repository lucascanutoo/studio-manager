import nodemailer from "nodemailer";

const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return {
    host,
    port: parseInt(port),
    secure,
    auth: { user, pass }
  };
};

const sendWelcomeEmail = async (to: string, name: string, studioName: string): Promise<void> => {
  const smtpConfig = getSmtpConfig();
  const from = process.env.SMTP_FROM || "Studio Manager";
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  const htmlTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        background-color: #fffaf7;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border: 1px solid #f0e5e0;
        border-radius: 12px;
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #9f5366 0%, #b8727f 100%);
        color: white;
        padding: 32px 24px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: bold;
      }
      .content {
        padding: 32px 24px;
        color: #4a3f3a;
      }
      .greeting {
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 24px;
      }
      .studio-name {
        background-color: #f8dfe7;
        border-left: 4px solid #9f5366;
        padding: 16px;
        margin: 24px 0;
        border-radius: 4px;
        font-size: 18px;
        font-weight: 600;
        color: #9f5366;
      }
      .features {
        margin: 24px 0;
        padding: 0;
        list-style: none;
      }
      .features li {
        padding: 8px 0;
        padding-left: 24px;
        position: relative;
        font-size: 14px;
        line-height: 1.5;
        color: #6b5d58;
      }
      .features li:before {
        content: "✓";
        position: absolute;
        left: 0;
        color: #9f5366;
        font-weight: bold;
      }
      .cta {
        margin: 32px 0;
        text-align: center;
      }
      .cta-button {
        background-color: #9f5366;
        color: white;
        padding: 14px 32px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        display: inline-block;
        transition: background-color 0.2s;
      }
      .cta-button:hover {
        background-color: #8b475a;
      }
      .footer {
        background-color: #f5f1ed;
        padding: 24px;
        text-align: center;
        font-size: 12px;
        color: #9e8e8a;
        border-top: 1px solid #e8ddd8;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Studio Manager</h1>
      </div>
      <div class="content">
        <div class="greeting">
          <p>Olá <strong>${name}</strong>,</p>
          <p>Bem-vindo ao Studio Manager! Sua conta foi criada com sucesso e você está pronto para começar a organizar seu studio de beleza.</p>
        </div>

        <div class="studio-name">${studioName}</div>

        <p style="font-size: 14px; color: #6b5d58; line-height: 1.6;">Com o Studio Manager, você pode:</p>
        <ul class="features">
          <li>Gerenciar agenda de atendimentos</li>
          <li>Organizar dados dos clientes</li>
          <li>Controlar serviços oferecidos</li>
          <li>Acompanhar financeiro e pagamentos</li>
        </ul>

        <div class="cta">
          <a href="${appUrl}" class="cta-button">Acessar o Sistema</a>
        </div>

        <p style="font-size: 13px; color: #9e8e8a; margin-top: 32px; border-top: 1px solid #e8ddd8; padding-top: 24px;">
          Se tiver dúvidas, estamos aqui para ajudar. Entre em contato conosco.
        </p>
      </div>
      <div class="footer">
        <p style="margin: 0;">© 2026 Studio Manager. Todos os direitos reservados.</p>
      </div>
    </div>
  </body>
</html>
  `.trim();

  if (!smtpConfig) {
    console.log("[EMAIL] Mode dev - Email não será enviado. Conteúdo abaixo:");
    console.log(`[EMAIL] To: ${to}`);
    console.log(`[EMAIL] Subject: Bem-vindo ao Studio Manager`);
    console.log(`[EMAIL] Name: ${name}`);
    console.log(`[EMAIL] Studio: ${studioName}`);
    return;
  }

  const transporter = nodemailer.createTransport(smtpConfig);

  await transporter.sendMail({
    from,
    to,
    subject: "Bem-vindo ao Studio Manager",
    html: htmlTemplate
  });
};

export { sendWelcomeEmail };
