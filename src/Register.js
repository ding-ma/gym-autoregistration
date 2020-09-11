const puppeteer = require('puppeteer');
const sgMail = require('@sendgrid/mail');


const config = {
    "regEmail": "",
    "password": "",
    "timeSlots":[],
    "wantEmail": true,
    "notifEmail": "",
    "sgApiKey": "SG.xxx..."
};


async function sendEmail() {
    sgMail.setApiKey(config.sgApiKey);
    let msg = {
        to: config.notifEmail,
        from: {
            email: "gym.registration@mcgill.ca ",
            name: "Minerva"
        },
        subject: "Successful Gym registration for ",
        text: "You have been successfully registered for " //todo
    };
    await sgMail.send(msg)
    console.log("Email Sent!");
}

exports.Register = async (req, res) =>{

};
