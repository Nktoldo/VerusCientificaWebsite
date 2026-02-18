import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,       
  },
});

export async function POST(req: Request) {
  const data = await req.json();

  // gera HTML para os produtos se existirem
  const productsHtml = data.products && data.products.length > 0 ? data.products.map((product: any) => `
    <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px; background: linear-gradient(to bottom, #f0f9ff, #ffffff);">
      <div style="display: flex; gap: 16px; align-items: flex-start;">
        <div style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; background: #f0f9ff; display: flex; align-items: center; justify-content: center;">
          <img src="${product.imageUrl}" alt="${product.title}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
        </div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #1e40af;">${product.title}</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">${product.subtitle}</p>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #3b82f6;">Fornecido por: ${product.supplier}</p>
          ${product.price ? `<p style="margin: 0; font-size: 14px; font-weight: 600; color: #059669;">R$ ${product.price.toLocaleString('pt-BR')}</p>` : ''}
          <a href="${product.productUrl}" style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 12px;">Ver Produto</a>
        </div>
      </div>
    </div>
  `).join('') : '';

  // template HTML do email
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nova Solicitação de Orçamento - Verus Científica</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Nova Solicitação de Orçamento</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Verus Científica</p>
      </div>

      <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
        <h2 style="color: #1e40af; margin-bottom: 20px; font-size: 22px;">Dados do Cliente</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
          <div>
            <strong>Nome:</strong> ${data.nome}
          </div>
          <div>
            <strong>Email:</strong> ${data.email}
          </div>
          <div>
            <strong>Telefone:</strong> ${data.telefone || 'Não informado'}
          </div>
          <div>
            <strong>Empresa:</strong> ${data.empresa || 'Não informado'}
          </div>
          <div>
            <strong>Cargo:</strong> ${data.cargo || 'Não informado'}
          </div>
          <div>
            <strong>Departamento:</strong> ${data.departamento || 'Não informado'}
          </div>
          <div>
            <strong>Estado:</strong> ${data.estado || 'Não informado'}
          </div>
          <div>
            <strong>Cidade:</strong> ${data.cidade || 'Não informado'}
          </div>
        </div>
        ${data.predio ? `<div><strong>Prédio:</strong> ${data.predio}</div>` : ''}
        ${data.laboratorio ? `<div><strong>Laboratório/Sala:</strong> ${data.laboratorio}</div>` : ''}
        ${data.mensagem ? `
          <div style="margin-top: 20px;">
            <strong>Mensagem:</strong>
            <p style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 8px 0 0 0;">${data.mensagem}</p>
          </div>
        ` : ''}
      </div>

      ${productsHtml ? `
        <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1e40af; margin-bottom: 20px; font-size: 22px;">Produtos Solicitados (${data.products.length})</h2>
          ${productsHtml}
        </div>
      ` : ''}
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_TO,
    subject: 'Novo orçamento recebido pelo website',
    html: htmlContent,
    text:
      `Orçamento recebido pelo website:\n\n` +
      ` --> Nome: ${data.nome}\n` +
      ` --> Empresa: ${data.empresa}\n` +
      ` --> Telefone: ${data.telefone}\n` +
      ` --> Email: ${data.email}\n` +
      ` --> Cargo: ${data.cargo}\n` +
      ` --> Departamento: ${data.departamento}\n\n` +
      (data.predio ? ` --> Prédio: ${data.predio}\n` : '') +
      (data.laboratorio ? ` --> Laboratório/Sala: ${data.laboratorio}\n` : '') +
      ` --> Estado: ${data.estado}\n` +
      ` --> Cidade: ${data.cidade}\n\n` +
      ` --> Mensagem:\n${data.mensagem}\n` +
      (data.products && data.products.length > 0 ? `\n --> Produtos selecionados: ${data.products.length} produtos\n` : '')
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
} 