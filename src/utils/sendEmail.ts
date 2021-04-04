import nodemailer from 'nodemailer'

// async..await is not allowed in global scope, must use a wrapper
export const sendEmail = async (to: string, html: string) => {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount()

  // Log the test account credentials to reuse. Then we save it in .env. We don't want to create each new one whenever we start server.
  // console.log('testAccount', testAccount)

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      // user: testAccount.user, // generated ethereal user
      user: 'ii543kgasvicpxh2@ethereal.email', // hardcode after console.log
      // pass: testAccount.pass // generated ethereal password
      pass: 'fSGQjWJwwXA4kV1fZV' // hardcode after console.log
    },
    tls: {
      rejectUnauthorized: false // to avoid NodeJS self signed certificate error
    }
  })

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to, // list of receivers
    subject: 'Change password', // Subject line
    // text // plain text body
    html // html body
  })

  console.log('Message sent: %s', info.messageId)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
