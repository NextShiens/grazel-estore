const nodemailer = require("nodemailer");
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT as string, 10),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOrderStatusUpdateEmail = async (
  email: string,
  orderId: string,
  status: string
) => {
  let emailText = "";
  let emailHtml = "";

  switch (status) {
    case "shipped":
      emailText = `Dear Customer,
  
  We hope this email finds you well.
  
  We are excited to inform you that your order with ID ${orderId} has been shipped. You can expect your package to arrive soon.
  
  Thank you for shopping with us.
  
  Best regards,
  The Grazle Team`;

      emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Order Status Update</h2>
          <p>Dear Customer,</p>
          <p>We hope this email finds you well.</p>
          <p>We are excited to inform you that your order with ID <strong>${orderId}</strong> has been shipped. You can expect your package to arrive soon.</p>
          <p>Thank you for shopping with us.</p>
          <p>Best regards,</p>
          <p><strong>The Grazle Team</strong></p>
        </div>
        `;
      break;

    case "completed":
      emailText = `Dear Customer,
  
  We hope this email finds you well.
  
  We are pleased to inform you that your order with ID ${orderId} has been successfully completed. We hope you are satisfied with your purchase.
  
  Thank you for shopping with us.
  
  Best regards,
  The Grazle Team`;

      emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Order Status Update</h2>
          <p>Dear Customer,</p>
          <p>We hope this email finds you well.</p>
          <p>We are pleased to inform you that your order with ID <strong>${orderId}</strong> has been successfully completed. We hope you are satisfied with your purchase.</p>
          <p>Thank you for shopping with us.</p>
          <p>Best regards,</p>
          <p><strong>The Grazle Team</strong></p>
        </div>
        `;
      break;

    case "cancelled":
      emailText = `Dear Customer,
  
  We hope this email finds you well.
  
  We regret to inform you that your order with ID ${orderId} has been cancelled. If you have any questions or concerns, please do not hesitate to contact our customer support team.
  
  Thank you for your understanding.
  
  Best regards,
  The Grazle Team`;

      emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Order Status Update</h2>
          <p>Dear Customer,</p>
          <p>We hope this email finds you well.</p>
          <p>We regret to inform you that your order with ID <strong>${orderId}</strong> has been cancelled. If you have any questions or concerns, please do not hesitate to contact our customer support team.</p>
          <p>Thank you for your understanding.</p>
          <p>Best regards,</p>
          <p><strong>The Grazle Team</strong></p>
        </div>
        `;
      break;

    default:
      emailText = `Dear Customer,
  
  We hope this email finds you well.
  
  We are writing to inform you that the status of your order with ID ${orderId} has been updated to: ${status}.
  
  Thank you for shopping with us.
  
  Best regards,
  The Grazle Team`;

      emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Order Status Update</h2>
          <p>Dear Customer,</p>
          <p>We hope this email finds you well.</p>
          <p>We are writing to inform you that the status of your order with ID <strong>${orderId}</strong> has been updated to: <strong>${status}</strong>.</p>
          <p>Thank you for shopping with us.</p>
          <p>Best regards,</p>
          <p><strong>The Grazle Team</strong></p>
        </div>
        `;
  }

  const mailOptions = {
    from: '"Grazle" <grazle@info.com>',
    to: email,
    subject: "Order Status Update",
    text: emailText,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const sendOrderCancellationEmailToSeller = async (
  email: string,
  orderId: string
) => {
  const emailText = `Dear Seller,
  
  We hope this email finds you well.
  
  We regret to inform you that the order with ID ${orderId} has been cancelled by the buyer. If you have any questions or concerns, please do not hesitate to contact our support team.
  
  Thank you for your understanding.
  
  Best regards,
  The Grazle Team`;

  const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Order Cancellation Notification</h2>
        <p>Dear Seller,</p>
        <p>We hope this email finds you well.</p>
        <p>We regret to inform you that the order with ID <strong>${orderId}</strong> has been cancelled by the buyer. If you have any questions or concerns, please do not hesitate to contact our support team.</p>
        <p>Thank you for your understanding.</p>
        <p>Best regards,</p>
        <p><strong>The Grazle Team</strong></p>
      </div>
    `;

  const mailOptions = {
    from: '"Grazle" <grazle@info.com>',
    to: email,
    subject: "Order Cancellation Notification",
    text: emailText,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to seller");
  } catch (error) {
    console.error("Error sending email to seller:", error);
  }
};

export const sendStoreProfileStatusEmail = async (
  email: string,
  isActive: boolean
) => {
  const statusText = isActive ? "approved" : "disapproved";
  const statusHtml = isActive ? "approved" : "disapproved";

  const emailText = `Dear Seller,

We hope this email finds you well.

We are writing to inform you that your store profile has been ${statusText}. If you have any questions or concerns, please do not hesitate to contact our support team.

Thank you for your cooperation.

Best regards,
The Grazle Team`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Store Profile Status Update</h2>
      <p>Dear Seller,</p>
      <p>We hope this email finds you well.</p>
      <p>We are writing to inform you that your store profile has been <strong>${statusHtml}</strong>. If you have any questions or concerns, please do not hesitate to contact our support team.</p>
      <p>Thank you for your cooperation.</p>
      <p>Best regards,</p>
      <p><strong>The Grazle Team</strong></p>
    </div>
  `;

  const mailOptions = {
    from: '"Grazle" <grazle@info.com>',
    to: email,
    subject: "Store Profile Status Update",
    text: emailText,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Store profile status email sent successfully to ${email}`);
  } catch (error) {
    console.error("Error sending store profile status email:", error);
  }
};
