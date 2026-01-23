'use strict';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function findAmountInCurrentCity(address) {
  let amount = '';

  if (address === 'PRISHTINA') {
    amount = '€';
  } else if (address === 'SHKUPI') {
    amount = 'Denar';
  } else {
    amount = 'Lekë';
  }

  return amount;
}

function findPriceInCurrentCity(item, address) {
  let price = 0;

  if (address === 'PRISHTINA') {
    price = item.product.price_euro;
  } else if (address === 'SHKUPI') {
    price = item.product.price_denar;
  } else {
    price = item.product.price_leke;
  }

  return price;
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

async function sendEmail(booksToSend, address, guest) {
  let bodyTable = '';
  let allPrices = 0;

  booksToSend.forEach((item) => {
    const price = findPriceInCurrentCity(item, address);
    const total = Number(item.quantity) * price;
    const currency = findAmountInCurrentCity(address);

    bodyTable +=
      "<tr style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
      "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" + item.product.title + "</td>" +
      "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" + price + currency + "</td>" +
      "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" + item.quantity + "</td>" +
      "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" + total + currency + "</td>" +
      "</tr>";

    allPrices += total;
  });

  bodyTable +=
    "<tr><td></td><td></td><td></td><td></td></tr>" +
    "<tr style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
    "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>Totali i gjithe librave</td><td></td><td></td>" +
    "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" + allPrices + findAmountInCurrentCity(address) + "</td>" +
    "</tr>";

  const mainTable =
    "<table style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
    "<thead><tr>" +
    "<th style='border: 1px solid #dbdbdb; padding: 3px 5px'>Titulli i Librit</th>" +
    "<th style='border: 1px solid #dbdbdb; padding: 3px 5px'>Cmimi</th>" +
    "<th style='border: 1px solid #dbdbdb; padding: 3px 5px'>Sasia</th>" +
    "<th style='border: 1px solid #dbdbdb; padding: 3px 5px'>Totali</th>" +
    "</tr></thead>" +
    "<tbody>" + bodyTable + "</tbody></table>";

  const html =
    "<p>Emri: <strong>" + guest.firstName + "</strong></p>" +
    "<p>Mbiemri: <strong>" + guest.lastName + "</strong></p>" +
    "<p>Qyteti: <strong>" + guest.city + "</strong></p>" +
    "<p>Emaili: <strong>" + guest.email + "</strong></p>" +
    "<p>Tel: <strong>" + guest.phoneNumber + "</strong></p>" +
    "<p>Adresa: <strong>" + guest.address + "</strong></p>" +
    "<p>Kodi Postar: <strong>" + guest.zipCode + "</strong></p>" +
    mainTable;

  const branchEmail = resolveBranchEmail(address);

  // IMPORTANT: SendGrid "from" must be verified in SendGrid
  const from = process.env.SENDGRID_FROM; // e.g. "Punat e Përit <orders@yourdomain.com>"

  const adminMsg = {
    to: 'agonhaxhani83@gmail.com', // keep as-is
    from,
    subject: `POROSI E RE NE ${String(address).toUpperCase()}, email test = ${branchEmail}`,
    html,
  };

  const buyerMsg = {
    to: guest.email,
    from,
    subject: 'Detajet e Porosise!',
    html: '<h3>Porosia eshte bere me sukses</h3>' + mainTable,
  };

  try {
    const [adminRes] = await sgMail.send(adminMsg);
    console.log('Admin email sent', {
      statusCode: adminRes.statusCode,
      // note: SendGrid doesn't always return a messageId here
      branchEmailLogged: branchEmail,
    });

    const [buyerRes] = await sgMail.send(buyerMsg);
    console.log('Buyer email sent', { statusCode: buyerRes.statusCode });

  } catch (error) {
    console.error('SendGrid error:', error?.response?.body || error);
  }
}

module.exports = {
  sendEmail,
};
