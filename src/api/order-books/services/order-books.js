'use strict';

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* -------------------- Helpers -------------------- */

function findAmountInCurrentCity(address) {
  const city = String(address || '').toUpperCase();
  if (city === 'PRISHTINA') return '€';
  if (city === 'SHKUPI') return 'Denar';
  return 'Lekë';
}

function findPriceInCurrentCity(item, address) {
  const city = String(address || '').toUpperCase();
  const p = item?.product || {};

  if (city === 'PRISHTINA') return Number(p.price_euro || 0);
  if (city === 'SHKUPI') return Number(p.price_denar || 0);
  return Number(p.price_leke || 0);
}

function resolveBranchEmail(address) {
  const city = String(address || '').toUpperCase();
  if (city === 'PRISHTINA') return 'promovimi.arprishtine@gmail.com';
  if (city === 'SHKUPI') return 'akropolirisk@gmail.com';
  if (city === 'VLORA') return 'akropoliirivlore@gmail.com';
  if (city === 'TIRANA') return 'nefersilent@gmail.com';
  if (city === 'DURRES') return 'kreshnikqorraj@gmail.com';
  return '';
}

/* -------------------- HTML Builders -------------------- */

function buildOrderTable(books, address) {
  let rows = '';
  let totalSum = 0;
  const currency = findAmountInCurrentCity(address);

  (books || []).forEach((item) => {
    const price = findPriceInCurrentCity(item, address);
    const qty = Number(item.quantity || 0);
    const total = price * qty;

    rows += `
      <tr>
        <td>${item.product.title}</td>
        <td>${price} ${currency}</td>
        <td>${qty}</td>
        <td>${total} ${currency}</td>
      </tr>
    `;

    totalSum += total;
  });

  rows += `
    <tr><td colspan="3"><strong>Totali i gjithe librave</strong></td>
    <td><strong>${totalSum} ${currency}</strong></td></tr>
  `;

  return `
    <table border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>Titulli i Librit</th>
          <th>Cmimi</th>
          <th>Sasia</th>
          <th>Totali</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function buildAdminHtml(guest, tableHtml) {
  return `
    <p>Emri: <strong>${guest.firstName}</strong></p>
    <p>Mbiemri: <strong>${guest.lastName}</strong></p>
    <p>Qyteti: <strong>${guest.city}</strong></p>
    <p>Emaili: <strong>${guest.email}</strong></p>
    <p>Tel: <strong>${guest.phoneNumber}</strong></p>
    <p>Adresa: <strong>${guest.address}</strong></p>
    <p>Kodi Postar: <strong>${guest.zipCode}</strong></p>
    ${tableHtml}
  `;
}

/* -------------------- Main Function -------------------- */

async function sendEmail(booksToSend, address, guest) {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM) {
    throw new Error('Missing SendGrid environment variables');
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const branchEmail = resolveBranchEmail(address);
  const city = String(address).toUpperCase();

  const orderTable = buildOrderTable(booksToSend, address);
  const adminHtml = buildAdminHtml(guest, orderTable);

  const from = {
    email: process.env.SENDGRID_FROM,
    name: 'Punat e Përit',
  };

  try {
    /* ---- Admin email ---- */
    await sgMail.send({
      to: adminEmail,
      from,
      subject: `POROSI E RE NE ${city} | branch=${branchEmail}`,
      html: adminHtml,
    });

    /* ---- Buyer email ---- */
    await sgMail.send({
      to: guest.email,
      from,
      subject: 'Detajet e Porosise!',
      html: `<h3>Porosia eshte bere me sukses</h3>${orderTable}`,
    });

    console.log('SendGrid emails sent successfully', {
      city,
      branchEmail,
      adminEmail,
      buyerEmail: guest.email,
    });
  } catch (err) {
    console.error(
      'SendGrid error:',
      err?.response?.body || err.message || err
    );
    throw err;
  }
}

module.exports = {
  sendEmail,
};
