const sgmail = require('@sendgrid/mail');

// const sgAPIKey = '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';

sgmail.setApiKey(process.env.SENDGRID_API_KEY);


const sendWelcomeMsg = (email, name) => {
    sgmail.send({
        to: email,
        from: 'abhinavy14@gmail.com',
        subject: 'Thanks for joining in!!!',
        text: `welcome to task manager app ${name},let us know how you get along with the app.`
    })
}

const sendCancelationMsg = (email, name) => {
    sgmail.send({
        to: email,
        from: 'abhinavy14@gmail.com',
        subject: 'thanks for using our app',
        text: `bye ${name}, tell us about what we could have done to not leave us`
    })
}

module.exports = {
    sendWelcomeMsg,
    sendCancelationMsg
}