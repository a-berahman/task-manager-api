const sgMail = require('@sendgrid/mail')



sgMail.setApiKey(process.env.SENDGRID_API_KEY)


// sgMail.send({
//     to: 'a.berahman@hotmail.com',
//     from: 'dev.pbera@gmail.com',
//     subject: 'This is my first creation',
//     text: 'I hope this one actually get to you.'
// })


const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'dev.pbera@gmail.com',
        subject: 'Thanks fro joining in.',
        text: `Welcome to the app, ${name}, Let me know how you get along with the app.`,

    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'dev.pbera@gmail.com',
        subject: 'Cancelation Email',
        text: `Dear ${name}Why they canceled your acount`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}