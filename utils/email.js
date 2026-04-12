const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

const sendOrderEmail = async (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} x ${item.qty}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.qty).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #111; padding: 20px; text-align: center;">
        <h1 style="color: #d4af37; margin: 0; letter-spacing: 2px;">ALPHADETAIL</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #111;">Order Confirmed!</h2>
        <p>Hi ${order.address.first},</p>
        <p>Thank you for your order! Your payment was successful and we're getting your items ready for shipment.</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111;">Order Details:</h3>
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${order.orderNum}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Payment Status:</strong> ${order.paymentStatus.toUpperCase()}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 10px; background: #eee;">Product</th>
              <th style="text-align: right; padding: 10px; background: #eee;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Subtotal</td>
              <td style="padding: 10px; text-align: right; font-weight: bold;">₹${order.subtotal.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Shipping</td>
              <td style="padding: 10px; text-align: right; font-weight: bold;">${order.shipping === 0 ? 'FREE' : '₹' + order.shipping}</td>
            </tr>
            ${order.bundleDiscount > 0 ? `
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #d4af37;">Bundle Discount</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; color: #d4af37;">-₹${Math.round(order.bundleDiscount).toLocaleString('en-IN')}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px; font-size: 18px; font-weight: bold; border-top: 2px solid #111;">Total</td>
              <td style="padding: 10px; font-size: 18px; font-weight: bold; text-align: right; border-top: 2px solid #111;">₹${Math.round(order.total).toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <h3 style="color: #111;">Delivery Address:</h3>
          <p style="margin: 5px 0;">${order.address.first} ${order.address.last || ''}</p>
          <p style="margin: 5px 0;">${order.address.addr}</p>
          <p style="margin: 5px 0;">${order.address.city}, ${order.address.pin}</p>
          <p style="margin: 5px 0;">Phone: ${order.address.phone}</p>
        </div>
      </div>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888;">
        <p>© 2024 AlphaDetail Car Care. All rights reserved.</p>
        <p>If you have any questions, reply to this email or contact us via WhatsApp.</p>
      </div>
    </div>
  `;

  await sendEmail({
    email: order.address.email,
    subject: `Order Confirmation - #${order.orderNum} | AlphaDetail`,
    html,
  });
};

module.exports = { sendEmail, sendOrderEmail };
