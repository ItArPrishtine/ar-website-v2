'use strict';

const nodemailer = require('nodemailer');

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

function findEmailInCurrentCity(address) {
  let email = '';

  if (address === 'PRISHTINA') {
    email = 'promovimi.arprishtine@gmail.com';
  } else if (address === 'SHKUPI') {
    email = 'promovimi.arprishtine@gmail.com';
  } else if (address === 'TIRANA') {
    email = 'denisaaa968@gmail.com';
  } else if (address === 'VLORA') {
    email = 'akropoliirivlore@gmail.com';
  } else {
    email = 'kreshnikqorraj@gmail.com';
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

async function sendEmail(booksToSend, address, guest) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: 'punatepret@gmail.com',
      pass: 'ajatsplzyhexhyub',
    },
  });

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

  const mailOptions = {
    from: 'punatepret@gmail.com',
    to: findEmailInCurrentCity(address),
    subject: `POROSI E RE NE ${address.toUpperCase()}`,
    html: html,
  };

  const buyer = {
    from: 'punatepret@gmail.com',
    to: guest.email,
    subject: 'Detajet e Porosise!',
    html: '<h3>Porosia eshte bere me sukses</h3>' + mainTable,
  };

  try {
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(buyer);
    console.log('Emails sent successfully');
  } catch (error) {
    console.error('Error sending emails:', error);
  }
}

module.exports = {
  sendEmail,
};
