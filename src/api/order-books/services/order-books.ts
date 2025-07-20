import nodemailer, { Transporter } from 'nodemailer';

interface Book {
  product: {
    attributes: {
      title: string;
      price_euro: number;
      price_denar: number;
      price_leke: number;
    };
  };
  quantity: number;
}

interface Guest {
  firstName: string;
  lastName: string;
  city: string;
  email: string;
  phoneNumber: string;
  address: string;
  zipCode: string;
}

function findAmountInCurrentCity(address: string): string {
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

function findPriceInCurrentCity(item: Book, address: string): number {
  let price = 0;

  if (address === 'PRISHTINA') {
    price = item.product.attributes.price_euro;
  } else if (address === 'SHKUPI') {
    price = item.product.attributes.price_denar;
  } else {
    price = item.product.attributes.price_leke;
  }

  return price;
}

async function sendEmail(booksToSend: Book[], address: string, guest: Guest): Promise<void> {
  const transporter: Transporter = nodemailer.createTransport({
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
    bodyTable +=
      "<tr style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
      "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
      item.product.attributes.title +
      "</td>" +
      "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
      findPriceInCurrentCity(item, address) + findAmountInCurrentCity(address) +
      "</td>" +
      "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
      item.quantity +
      "</td>" +
      "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
      Number(item.quantity) * findPriceInCurrentCity(item, address) + findAmountInCurrentCity(address) +
      "</td>" +
      "</tr>";

    allPrices += Number(item.quantity) * findPriceInCurrentCity(item, address);
  });

  bodyTable +=
    "<tr><td></td><td></td><td></td><td></td></tr>" +
    "<tr style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
    "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>Totali i gjithe librave</td> <td style='border: 1px solid #dbdbdb; padding: 3px 5px'></td> <td style='border: 1px solid #dbdbdb; padding: 3px 5px'></td> " +
    "<td style='border: 1px solid #dbdbdb; padding: 3px 5px'>" + allPrices + findAmountInCurrentCity(address) + "</td></tr>";

  const mainTable =
    "<table style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
    "<thead style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
    "<th style='border: 1px solid #dbdbdb; padding: 3px 5px'>Titulli i Librit</th>" +
    "<th style='border: 1px solid #dbdbdb; padding: 3px 5px'>Cmimi</th>" +
    "<th style='border: 1px solid #dbdbdb; padding: 3px 5px'>Sasia</th>" +
    "<th style='border: 1px solid #dbdbdb; padding: 3px 5px'>Totali</th>" +
    "</thead>" +
    "<tbody style='border: 1px solid #dbdbdb; padding: 3px 5px'>" +
    bodyTable +
    "</tbody>" +
    "</table>";

  const html =
    "<p>Emri: <strong>" + guest.firstName + "</strong></p>" +
    "<p>Mbiemri: <strong>" + guest.lastName + "</strong></p>" +
    "<p>Qyteti: <strong>" + guest.city + "</strong></p>" +
    "<p>Emaili: <strong>" + guest.email + "</strong></p>" +
    "<p>Tel: <strong>" + guest.phoneNumber + "</strong></p>" +
    "<p>Adresa: <strong>" + guest.address + "</strong></p>" +
    "<p>Kodi Postar: <strong>" + guest.zipCode + "</strong></p>" + mainTable;

  const mailOptions = {
    from: 'punatepret@gmail.com',
    to: 'agonhaxhani83@gmail.com',
    subject: `POROSI E RE NE ${address.toUpperCase()}`,
    html: html,
  };

  const buyer = {
    from: 'punatepret@gmail.com',
    to: guest.email,
    subject: `Detajet e Porosise!`,
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

export default {
  sendEmail: sendEmail,
};
