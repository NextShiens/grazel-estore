const nodemailer = require("nodemailer");
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  auth: {
    user: "info@grazle.co.in",
    pass: "Hemant@12#%$#^5q26",
  },
});

export const sendOrderConfirmationEmail = async (
  email: string,
  tracking_id: string
) => {
  const emailText = `Dear Customer,

  We are delighted to confirm your order. Your order has been successfully placed, and your tracking ID is ${tracking_id}. You can use this ID to track the status of your order.

  Thank you for shopping with us.

  Best regards,
  The Grazle Team`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Order Confirmation</h2>
      <p>Dear Customer,</p>
      <p>We are delighted to confirm your order.</p>
      <p>Your order has been successfully placed, and your tracking ID is <strong>${tracking_id}</strong>. You can use this ID to track the status of your order.</p>
      <p>Thank you for shopping with us.</p>
      <p>Best regards,</p>
      <p><strong>The Grazle Team</strong></p>
    </div>
  `;

  const mailOptions = {
    from: '"Grazle" <info@grazle.co.in>',
    to: email,
    subject: "Order Confirmation",
    text: emailText,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
};

export const sendMembershipActivationEmail = async (
  email: string,
  membershipPlanName: string,
  startDate: Date,
  endDate: Date
) => {
  const formattedStartDate = startDate.toLocaleDateString();
  const formattedEndDate = endDate.toLocaleDateString();

  const emailText = `Dear Customer,

  We are excited to confirm the activation of your membership plan: ${membershipPlanName}. Your membership is now active.

  Membership Details:
  - Plan: ${membershipPlanName}
  - Start Date: ${formattedStartDate}
  - End Date: ${formattedEndDate}

  Thank you for being a valued member of our community.

  Best regards,
  The Grazle Team`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Membership Activation Confirmation</h2>
      <p>Dear Customer,</p>
      <p>We are excited to confirm the activation of your membership plan: <strong>${membershipPlanName}</strong>. Your membership is now active.</p>
      <p><strong>Membership Details:</strong></p>
      <ul>
        <li>Plan: ${membershipPlanName}</li>
        <li>Start Date: ${formattedStartDate}</li>
        <li>End Date: ${formattedEndDate}</li>
      </ul>
      <p>Thank you for being a valued member of our community.</p>
      <p>Best regards,</p>
      <p><strong>The Grazle Team</strong></p>
    </div>
  `;

  const mailOptions = {
    from: '"Grazle" <info@grazle.co.in>',
    to: email,
    subject: "Membership Plan Activation Confirmation",
    text: emailText,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Membership activation confirmation email sent successfully");
  } catch (error) {
    console.error(
      "Error sending membership activation confirmation email:",
      error
    );
  }
};

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
    from: '"Grazle" <info@grazle.co.in>',
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
    from: '"Grazle" <info@grazle.co.in>',
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
    from: '"Grazle" <info@grazle.co.in>',
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
