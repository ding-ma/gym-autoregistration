const puppeteer = require('puppeteer');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const config = {
    "email": process.env.EMAIL,
    "password": process.env.PASWORD,
    "timeSlots": {
        "Monday": ["6:30", "10:30"],
        "Tuesday": ["14:30", "12:30"],
        "Wednesday": ["18:30"],
        "Thursday": ["8:30", "18:30", "16:30"],
        "Friday": ["6:30", "8:30", "10:30"],
        "Saturday": ["9:00", "11:00"],
        "Sunday": ["11:00", "13:00"],
    },
    "wantEmail": true,
    "sgApiKey": process.env.SENDG_GRID_API
};


const weekendDict = {
    "9:00": 2,
    "11:00": 3,
    "13:00": 4
}


const weekdayDict = {
    "6:30": 2,
    "8:30": 3,
    "10:30": 4,
    "12:30": 5,
    "14:30": 6,
    "16:30": 7,
    "18:30": 8
}

function sleep(msg) {
    console.log(msg)
    return new Promise(resolve => setTimeout(resolve, 4000));
}

function getDayOfWeek(){
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    return days[[targetDate.getDay()]];
}

function getEnrollmentButtonPath(time) {
    if (time === "Saturday" || time === "Sunday") {
        return "#lstSchedules > table > tbody > tr:nth-child(" + weekendDict[time] + ") > td:nth-child(1) > input";
    } else {
        return "#lstSchedules > table > tbody > tr:nth-child(" + weekdayDict[time] + ") > td:nth-child(1) > input";
    }
}


async function isFull(page, time) {
    let selector;
    const dayOfWeek = getDayOfWeek();
    if (dayOfWeek === "Saturday" || dayOfWeek === "Sunday") {
        selector = "#lstSchedules > table > tbody > tr:nth-child(" + weekendDict[time] + ") > td:nth-child(7)"
    } else {
        selector = "#lstSchedules > table > tbody > tr:nth-child(" + weekdayDict[time] + ") > td:nth-child(7)";
    }

    const element = await page.$(selector);
    const text = await page.evaluate(element => element.textContent, element);
    return text.split("/")[0] === text.split("/")[1];
}

function getRegisteringDate() {
    //Configure the date you want to Select
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);

    const dd = targetDate.getDate();

    //for finding the row
    const monthStart = new Date();
    monthStart.setDate(1)
    const IndexofFirst = monthStart.getDay() + 1;

    const indexWeekDay = targetDate.getDay() + 1;
    const rowMethodA = indexWeekDay % 7; //remainder

    let weekRow = Math.floor(dd / 7) + 1;     //integer

    if ((rowMethodA + IndexofFirst) > 7) {
        weekRow += 1;
    }
    return "#ui-datepicker-div > table > tbody > tr:nth-child(" + weekRow + ") > td:nth-child(" + indexWeekDay + ")";
}


//changes month if the today +2 is next month
async function nextMonth(page){
    const today = new Date();

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);

    const indexOfTodayMonth = today.getMonth();
    const indexOfTargetMonth = targetDate.getMonth();

    if(indexOfTargetMonth !== indexOfTodayMonth){
        await page.click("#ui-datepicker-div > div > a.ui-datepicker-next.ui-corner-all")
    }
}

async function tryRegister(page){
    await sleep("looking for available time")
    const hours = config.timeSlots[getDayOfWeek()];
    for( let i=0; i <hours.length; i++){
        console.log(hours[i])
        if(!await isFull(page, hours[i])){
            await page.click(getEnrollmentButtonPath(hours[i]));
            await page.click("#btnWaiverAgree");
            await page.click("#ctl00_pageContentHolder_btnContinueCart")

            if (config.wantEmail){
                await sendEmail(hours[i]);
            }
            return true;
        }
    }
    return false
}

//todo
async function tryWaitlist(page) {

}

async function sendEmail(time) {

    sgMail.setApiKey(config.sgApiKey);
    let msg = {
        to: config.email,
        from: {
            email: "gym.registration@mcgill.ca ",
            name: "McGill Gym"
        },
        subject: "Successful Gym Registration!",
        text: "You have been successfully registered for "+ getDayOfWeek() + " at " + time
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

    //Select DatePicker
    await sleep("picking date")
    await page.click("#pnlSelection > table.SmallTableBorder > tbody > tr:nth-child(6) > td:nth-child(2) > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td:nth-child(1) > span > label")
    await page.click("#ctl00_pageContentHolder_ctrlFromDate_trshowCal > img")

    await nextMonth(page);

    await page.click(getRegisteringDate())


    //click on list view
    await sleep("getting list")    //only way i found to wait for the element
    await page.click('#ctl00_pageContentHolder_lnkGriedView');

    //search button
    await sleep("Searching")
    await page.click('#btnSearch')

    //pick the training hours and register
    //doesnt work for a waitlist
    if(!await tryRegister(page)){
        await tryWaitlist(page);
    }

     await browser.close();
};
