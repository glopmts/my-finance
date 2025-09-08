import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Sistema de Finanças" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw new Error("Falha ao enviar email");
  }
};

export default transporter;
