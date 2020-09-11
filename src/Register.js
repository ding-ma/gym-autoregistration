const puppeteer = require('puppeteer');
const sgMail = require('@sendgrid/mail');


const config = {
    "email": "",
    "password": "",
    "timeSlots": [],
    "wantEmail": true,
    "notifEmail": "",
    "sgApiKey": "SG.xxx..."
};

// /html/body/form/div[3]/table[1]/tbody/tr/td/div/div/table/tbody/tr[2]/td/table/tbody/tr/td/table/tbody/tr[3]/td/div/div/div/table[2]/tbody/tr[2]/td/div/div/div[2]/table/tbody/tr[x]/td[y]/div
// /html/body/form/div[3]/table[1]/tbody/tr/td/div/div/table/tbody/tr[2]/td/table/tbody/tr/td/table/tbody/tr[3]/td/div/div/div/table[2]/tbody/tr[2]/td/div/div/div[2]/table/tbody/tr[9]/td[8]/div[1]
// /html/body/form/div[3]/table[1]/tbody/tr/td/div/div/table/tbody/tr[2]/td/table/tbody/tr/td/table/tbody/tr[3]/td/div/div/div/table[2]/tbody/tr[2]/td/div/div/div[2]/table/tbody/tr[7]/td[7]/div
// /html/body/form/div[3]/table[1]/tbody/tr/td/div/div/table/tbody/tr[2]/td/table/tbody/tr/td/table/tbody/tr[3]/td/div/div/div/table[2]/tbody/tr[2]/td/div/div/div[2]/table/tbody/tr[8]/td[7]/div
///html/body/form/div[3]/table[1]/tbody/tr/td/div/div/table/tbody/tr[2]/td/table/tbody/tr/td/table/tbody/tr[3]/td/div/div/div/table[2]/tbody/tr[2]/td/div/div/div[2]/table/tbody/tr[9]/td[7]/div[1] --> left one
// /html/body/form/div[3]/table[1]/tbody/tr/td/div/div/table/tbody/tr[2]/td/table/tbody/tr/td/table/tbody/tr[3]/td/div/div/div/table[2]/tbody/tr[2]/td/div/div/div[2]/table/tbody/tr[9]/td[8]/div[2] --> bottom one
//

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


};
