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

    //Select Currie Fitness Center
    await sleep("getting fitness center") 
    await page.click("#dk_container_ctl00_pageContentHolder_ddlCategory > a")
    await page.click('#dk_container_ctl00_pageContentHolder_ddlCategory > div > ul > li:nth-child(7) > a');

    //Configure the date you want to Select 
    var targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);

    var dd = targetDate.getDate();
    var mm = targetDate.getMonth() + 1; // 0 is January, so we must add 1
    var yyyy = targetDate.getFullYear();
    var indexOfDay = targetDate.getDay() + 1;


    //for finding the row
    var monthStart = new Date();
    monthStart.setDate(1)
    var IndexofFirst = monthStart.getDay() + 1;

    var indexWeekDay = targetDate.getDay() + 1;
    var rowMethodA = indexWeekDay % 7; //remainder
    var rowMethodB = Math.floor(dd / 7); //integer

    var weekRow = rowMethodB + 1;

    if((rowMethodA + IndexofFirst) > 7 ){
         weekRow + 1;
    }

     //For dropdown menu selection of month
     if (mm.length === 2){
        mm = mm.substring(1);
    }

    //Select DatePicker
    await page.click('#ctl00_pageContentHolder_ctrlFromDate_txtDate')
    //Month
    await page.click('#ui-datepicker-div > div > div > select.ui-datepicker-month')
    await page.click('#ui-datepicker-div > div > div > select.ui-datepicker-month > ul > li:nth-child(${mm}) > a');
    //Year
    await page.click('#ui-datepicker-div > div > div > select.ui-datepicker-year')
    await page.click('#ui-datepicker-div > div > div > select.ui-datepicker-year > ul > li:nth-child(${yyyy}) > a');
    //Day
    await page.click('#ui-datepicker-div > table > tbody > tr:nth-child(3) > td:nth-child($indexWeekDay) > a')
    document.querySelector("#ui-datepicker-div > table > tbody > tr:nth-child($weekRow) > td:nth-child($indexOfDay) > a")
    


    //click on list view
    await sleep("getting list")    //only way i found to wait for the element
    await page.click('#ctl00_pageContentHolder_lnkGriedView');

    //search button
    await sleep("Searching")
    await page.click('#btnSearch')


    await browser.close();
};
