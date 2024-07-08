const nodemailer = require('nodemailer');
require('dotenv').config(); 


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.EMAIL_PASSWORD, 
  },
});


const sendVerificationEmail = (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL, 
    to: email, 
    subject: 'Email Verification', 
    text: `Your verification code is ${code}`, 
  };

  
  return transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
