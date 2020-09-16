const puppeteer = require('puppeteer');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const config = {
    "email": process.env.EMAIL,
    "password": process.env.PASWORD,
    "timeSlots": [],
    "wantEmail": true,
    "notifEmail": "",
    "sgApiKey": process.env.SENDG_GRID_API
};


function sleep(msg) {
    console.log(msg)
    return new Promise(resolve => setTimeout(resolve, 5000));
}

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

exports.register = async (req, res) => {
    let browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: false //set to false if you want to see browser
    });
    let page = await browser.newPage();
    await page.goto('https://mcgillathletics.ca/sports/2018/7/17/fitness-centre-member-info.aspx?id=423');
    await page.waitForXPath("/html/body/form/main/article/div/div[4]/div/div[1]/p/a").then(s => s.click());
    await page.waitForNavigation();

    //logs in
    await page.type('#UserName', config.email, {delay: 30});
    await page.type('#UserPass', config.password, {delay: 30});
    await page.click('#Signin');
    await page.waitForNavigation();

    //brings you to book workout page
    await page.goto('https://hnd-p-ols.spectrumng.net/mcgill/Members/GroupExercise/ClassSchedules.aspx?isKiosk=False&pname=Book+your+workout&pid=GRX,0')

    //wait for navigation doesnt work well..... so just wait for 5000ms seems to do the trick

    //click on list view
    await sleep("getting list")    //only way i found to wait for the element
    await page.click('#ctl00_pageContentHolder_lnkGriedView');

    //todo insert data picker here

    await sleep("getting fitness center")
    await page.click("#dk_container_ctl00_pageContentHolder_ddlCategory > a")
    await page.click('#dk_container_ctl00_pageContentHolder_ddlCategory > div > ul > li:nth-child(7) > a');

    //search button
    await sleep("Searching")
    await page.click('#btnSearch')


    await browser.close();
};
