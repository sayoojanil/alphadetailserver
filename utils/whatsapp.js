const twilio = require('twilio');

/**
 * Sends a WhatsApp message using Twilio
 * @param {string} to - Recipient's phone number (with country code, e.g., '+919876543210')
 * @param {string} body - The message content
 */
const sendWhatsAppMessage = async (to, body) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER; // Usually 'whatsapp:+14155238886' for sandbox

  if (!accountSid || !authToken || !from) {
    console.warn('[WHATSAPP] Missing Twilio credentials. Message not sent.');
    return;
  }

  const client = twilio(accountSid, authToken);

  try {
    // Ensure 'to' number starts with 'whatsapp:'
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    const message = await client.messages.create({
      body: body,
      from: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
      to: formattedTo
    });

    console.log(`[WHATSAPP] Message sent: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('[WHATSAPP] Error sending message:', error);
    throw error;
  }
};

module.exports = { sendWhatsAppMessage };
