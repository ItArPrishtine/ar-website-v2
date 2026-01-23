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
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   secure: false,
  //   tls: {
  //     rejectUnauthorized: false,
  //   },
  //   auth: {
  //     user: 'punatepret@gmail.com',
  //     pass: 'ajatsplzyhexhyub',
  //   },
  // });

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: 'punatepret@gmail.com',
      pass: 'ajatsplzyhexhyub',
    },
    connectionTimeout: 30_000,
    greetingTimeout: 30_000,
    socketTimeout: 30_000,
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

  let branchEmail = "";
  if (address.toUpperCase() === "PRISHTINA") {
    branchEmail = "promovimi.arprishtine@gmail.com";
  } else if (address.toUpperCase() === "SHKUPI") {
    branchEmail = "akropolirisk@gmail.com";
  } else if (address.toUpperCase() === "VLORA") {
    branchEmail = "akropoliirivlore@gmail.com";
  } else if (address.toUpperCase() === "TIRANA") {
    branchEmail = "nefersilent@gmail.com";
  } else if (address.toUpperCase() === "DURRES") {
    branchEmail = "kreshnikqorraj@gmail.com";
  }

  const mailOptions = {
    from: 'punatepret@gmail.com',
    to: 'agonhaxhani83@gmail.com',
    subject: `POROSI E RE NE ${address.toUpperCase()}, email test = ${branchEmail}`,
    html: html,
  };

  const buyer = {
    from: 'punatepret@gmail.com',
    to: guest.email,
    subject: 'Detajet e Porosise!',
    html: '<h3>Porosia eshte bere me sukses</h3>' + mainTable,
  };

  try {

    await transporter.verify();
    console.log("SMTP transporter verified");
    
    const info1 = await transporter.sendMail(mailOptions);
    console.log('Admin mail result:', {
      messageId: info1.messageId,
      accepted: info1.accepted,
      rejected: info1.rejected,
      response: info1.response,
    });
    
    const info2 = await transporter.sendMail(buyer);
    console.log('Buyer mail result:', {
      messageId: info2.messageId,
      accepted: info2.accepted,
      rejected: info2.rejected,
      response: info2.response,
    });
  } catch (error) {
    console.error('Error sending emails:', error);
  }
}

module.exports = {
  sendEmail,
};
