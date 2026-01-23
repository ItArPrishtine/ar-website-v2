'use strict';

const { Resend } = require('resend');

/**
 * ENV needed (Railway Variables):
 *   RESEND_API_KEY=...
 *   RESEND_FROM=onboarding@resend.dev   (works without a domain)
 * Optional:
 *   ADMIN_EMAIL=agonhaxhani83@gmail.com
 */
const resend = new Resend(process.env.RESEND_API_KEY);

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

function buildOrderTable(booksToSend, address) {
  let bodyTable = '';
  let allPrices = 0;
  const currency = findAmountInCurrentCity(address);

  (booksToSend || []).forEach((item) => {
    const price = findPriceInCurrentCity(item, address);
    const qty = Number(item?.quantity || 0);
    const total = qty * price;

    bodyTable +=
      "<tr style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
      "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
      String(item?.product?.title || '') +
      "</td>" +
      "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
      price +
      ' ' +
      currency +
      "</td>" +
      "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
      qty +
      "</td>" +
      "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
      total +
      ' ' +
      currency +
      "</td>" +
      '</tr>';

    allPrices += total;
  });

  bodyTable +=
    "<tr><td></td><td></td><td></td><td></td></tr>" +
    "<tr style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
    "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>Totali i gjithe librave</td><td></td><td></td>" +
    "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
    allPrices +
    ' ' +
    currency +
    '</td>' +
    '</tr>';

  const mainTable =
    "<table style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
    '<thead><tr>' +
    "<th style='border: 1px solid #dbdbdb; padding: 3px 5px'>Titulli i Librit</th>" +
    "<th style='border: 1px solid #dbdbdb; padding: 3px 5px'>Cmimi</th>" +
    "<th style='border: 1px solid #dbdbdb; padding: 3px 5px'>Sasia</th>" +
    "<th style='border: 1px solid #dbdbdb; padding: 3px 5px'>Totali</th>" +
    '</tr></thead>' +
    '<tbody>' +
    bodyTable +
    '</tbody></table>';

  return { mainTable, allPrices, currency };
}

function buildAdminHtml(guest, mainTable) {
  const g = guest || {};
  return (
    "<p>Emri: <strong>" +
    (g.firstName || '') +
    '</strong></p>' +
    "<p>Mbiemri: <strong>" +
    (g.lastName || '') +
    '</strong></p>' +
    "<p>Qyteti: <strong>" +
    (g.city || '') +
    '</strong></p>' +
    "<p>Emaili: <strong>" +
    (g.email || '') +
    '</strong></p>' +
    "<p>Tel: <strong>" +
    (g.phoneNumber || '') +
    '</strong></p>' +
    "<p>Adresa: <strong>" +
    (g.address || '') +
    '</strong></p>' +
    "<p>Kodi Postar: <strong>" +
    (g.zipCode || '') +
    '</strong></p>' +
    mainTable
  );
}

async function sendWithResend({ to, subject, html }) {
  const fromEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';
  const from = `Punat e Përit <${fromEmail}>`;

  // Resend accepts string or array for `to`
  return resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}

async function sendEmail(booksToSend, address, guest) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY env var');
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'agonhaxhani83@gmail.com';
  const city = String(address || '').toUpperCase();
  const branchEmail = resolveBranchEmail(address); // only for logging/subject (as you wanted)

  const { mainTable } = buildOrderTable(booksToSend, address);
  const adminHtml = buildAdminHtml(guest, mainTable);

  const adminSubject = `POROSI E RE NE ${city} | branchEmail=${branchEmail || 'N/A'}`;
  const buyerSubject = 'Detajet e Porosise!';

  try {
    const adminRes = await sendWithResend({
      to: adminEmail,
      subject: adminSubject,
      html: adminHtml,
    });

    const buyerRes = await sendWithResend({
      to: guest?.email,
      subject: buyerSubject,
      html: '<h3>Porosia eshte bere me sukses</h3>' + mainTable,
    });

    console.log('Emails sent successfully', {
      admin: { id: adminRes?.id },
      buyer: { id: buyerRes?.id },
      branchEmailLogged: branchEmail,
      city,
    });
  } catch (error) {
    // Resend often returns useful data in error.response / error.message
    console.error('Error sending emails:', error?.response || error?.message || error);
    throw error;
  }
}

module.exports = {
  sendEmail,
};
