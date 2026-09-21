import nodemailer from "nodemailer";

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
}

const FROM =
  process.env.MAIL_FROM ||
  (process.env.GMAIL_USER ? `SlideWrld <${process.env.GMAIL_USER}>` : "");

function money(amount) {
  return "\u20a6" + Number(amount).toLocaleString("en-NG");
}

function orderItemsHtml(order) {
  return order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e3e0d7;">${item.name} (Size ${item.size}) x${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e3e0d7;text-align:right;">${money(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");
}

function wrapHtml(title, bodyHtml) {
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;background:#f7f5f0;padding:32px;color:#17160f;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e3e0d7;padding:32px;">
      <h1 style="font-size:20px;letter-spacing:0.02em;margin:0 0 24px 0;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top:32px;font-size:12px;color:#57544a;">SlideWrld</p>
    </div>
  </div>`;
}

export async function sendOrderConfirmationEmail(order) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("GMAIL_USER / GMAIL_APP_PASSWORD not set, skipping order confirmation email");
    return;
  }
  const body = `
    <p>Hi ${order.customer.name},</p>
    <p>Thanks for your order. Here is a summary of what you ordered.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${orderItemsHtml(order)}
      <tr>
        <td style="padding:12px 0 0 0;font-weight:bold;">Total</td>
        <td style="padding:12px 0 0 0;text-align:right;font-weight:bold;">${money(order.total)}</td>
      </tr>
    </table>
    <p>Order reference: ${order.id}</p>
    <p>Payment: bank transfer. If you have not sent payment yet, please transfer the total above to the account details shown at checkout, then reply to this email with your receipt.</p>
    <p>We will email you again once your order status changes.</p>
  `;
  await transporter.sendMail({
    from: FROM,
    to: order.customer.email,
    subject: `Your SlideWrld order ${order.id}`,
    html: wrapHtml("Order received", body),
  });
}

export async function sendAdminOrderNotification(order) {
  const transporter = getTransporter();
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!transporter || !adminEmail) {
    console.warn("Gmail SMTP or admin email not configured, skipping admin notification");
    return;
  }
  const body = `
    <p>A new order was placed.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${orderItemsHtml(order)}
      <tr>
        <td style="padding:12px 0 0 0;font-weight:bold;">Total</td>
        <td style="padding:12px 0 0 0;text-align:right;font-weight:bold;">${money(order.total)}</td>
      </tr>
    </table>
    <p><strong>Customer:</strong> ${order.customer.name}<br/>
    <strong>Email:</strong> ${order.customer.email}<br/>
    <strong>Phone:</strong> ${order.customer.phone}<br/>
    <strong>Delivery address:</strong> ${order.customer.address}, ${order.customer.city}, ${order.customer.state}</p>
    <p>Order reference: ${order.id}</p>
  `;
  await transporter.sendMail({
    from: FROM,
    to: adminEmail,
    subject: `New order ${order.id} - ${money(order.total)}`,
    html: wrapHtml("New order placed", body),
  });
}

export async function sendOrderStatusEmail(order) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("GMAIL_USER / GMAIL_APP_PASSWORD not set, skipping order status email");
    return;
  }
  const statusMessages = {
    pending: "Your order is pending payment confirmation.",
    paid: "We have confirmed your payment. Your order is now being prepared.",
    shipped: "Your order has shipped and is on its way to you.",
    delivered: "Your order has been delivered. We hope you enjoy it.",
    cancelled: "Your order has been cancelled. Contact us if you were not expecting this.",
  };
  const message = statusMessages[order.status] || `Your order status is now: ${order.status}.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://slidewrld.com";
  const body = `
    <p>Hi ${order.customer.name},</p>
    <p>${message}</p>
    <p>Order reference: ${order.id}</p>
    <p>You can check your order status any time at <a href="${siteUrl}/track-order">${siteUrl}/track-order</a> using this reference and your email address.</p>
  `;
  await transporter.sendMail({
    from: FROM,
    to: order.customer.email,
    subject: `Update on your SlideWrld order ${order.id}`,
    html: wrapHtml("Order update", body),
  });
}

export async function sendNewsletterWelcomeEmail(email) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("GMAIL_USER / GMAIL_APP_PASSWORD not set, skipping newsletter welcome email");
    return;
  }
  const body = `<p>You are on the list. We will email you when new drops and offers go live.</p>`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "You're on the SlideWrld list",
    html: wrapHtml("Welcome to SlideWrld", body),
  });
}