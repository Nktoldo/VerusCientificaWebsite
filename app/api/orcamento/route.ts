import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 's3ndm4ilt0@gmail.com', // <-- coloque aqui o Gmail criado
    pass: 'bpsh avxv pmlr jswp',       
  },
});

export async function POST(req: Request) {
  const data = await req.json();

  await transporter.sendMail({
    from: 's3ndm4ilt0@gmail.com',
    to: 'vendas@veruscientifica.com.br',
    subject: 'Novo orçamento recebido pelo website',
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
      ` --> Mensagem:\n${data.mensagem}\n` 
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
} 