let fs = require("fs");
let xlsx = require("xlsx");
let path = require("path");
let puppeteer = require("puppeteer");
let links = ["https://www.glassdoor.co.in/Job/index.htm", "https://www.simplyhired.co.in/"];

async function glassdoorList(link, browserInstance, category) {
    let newTab = await browserInstance.newPage();
    await newTab.goto(link);
    await newTab.type("#KeywordSearch", category, { delay: 100 });
    await newTab.click("#LocationSearch");
    await newTab.keyboard.down("Control");
    await newTab.keyboard.press("A");
    await newTab.keyboard.press("Backspace");
    await newTab.keyboard.up("Control");
    await newTab.keyboard.press("Enter");
    await new Promise((resolve, reject) => setTimeout(resolve, 3000));

    async function extractData() {
        let companyNameArr = document.querySelectorAll(".d-flex.justify-content-between.align-items-start");
        let profileNameArr = document.querySelectorAll(".jobLink.css-1rd3saf.eigr9kq2");
        let salaryArr = document.querySelectorAll("span[data-test='detailSalary']");
        let ratingArr = document.querySelectorAll(".css-19pjha7.e1cjmv6j1");
        let linkArr = document.querySelectorAll(".d-flex.flex-column.css-x75kgh.e1rrn5ka3 a");
        let details = [];
        for (let i = 0; i < 10; i++) {
            if (companyNameArr[i] && profileNameArr[i] && salaryArr[i] && ratingArr[i]) {
                companyNameArr[i].click();
                await new Promise((resolve, reject) => setTimeout(resolve, 1000));
                let Company = companyNameArr[i].innerText;
                let Profile = profileNameArr[i].innerText;
                let Salary = salaryArr[i].innerText.split("\n");
                let Rating = ratingArr[i].innerText;
                let Link = "https://www.glassdoor.co.in/" + linkArr[i].getAttribute("href").trim();
                let obj = { Company, Profile, Salary, Rating, Link};
                details.push(obj);
            }
        }
        return details;
    }
    return await newTab.evaluate(extractData);
}

async function simplyHiredList(link, browserInstance, category) {
    let newTab = await browserInstance.newPage();
    await newTab.goto(link);
    await newTab.type("input[placeholder='Job Title, Skills or Company']", category, { delay: 100 });
    await newTab.click("#location");
    await newTab.keyboard.down("Control");
    await newTab.keyboard.press("A");
    await newTab.keyboard.up("Control");
    await newTab.keyboard.press("Backspace");
    await newTab.keyboard.press("Enter");
    await new Promise((resolve, reject) => setTimeout(resolve, 2000));

    async function extractData() {
        let companyName = document.querySelectorAll(".JobPosting-labelWithIcon.jobposting-company");
        let profileName = document.querySelectorAll(".jobposting-title");
        let locationArr = document.querySelectorAll(".jobposting-location");
        let linkArr = document.querySelectorAll(".jobposting-title a");
        let details = [];
        for (let i = 0, j = 0; i < 10; i++, j += 2) {
            companyName[i].click();
            await new Promise((resolve, reject) => setTimeout(resolve, 1000));
            let Company = companyName[i].innerText;
            let Profile = profileName[i].innerText;
            let Location = locationArr[j].innerText;
            let obj = { Company, Profile, Location };
            obj.Link = "https://www.simplyhired.co.in/" + linkArr[i].getAttribute("href");;

            details.push(obj)
        }
        return details;
    }
    return await newTab.evaluate(extractData);
}

function dirCreator(dirpath) {
    if (fs.existsSync(dirpath) == false) {
        fs.mkdirSync(dirpath);
    }
}

function excelWriter(filePath, content, sheetName) {
    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(content);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    xlsx.writeFile(newWB, filePath);
}

async function JobFn(cmd, category, dirpath) {
    try {
        let browserInstance = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized",]
        });
        let folderPath = path.join(dirpath, cmd);
        dirCreator(folderPath);
        for (let i = 0; i < links.length; i++) {
            let siteName = links[i].split(".")[1];
            let data = "";
            if (siteName == "glassdoor")
                data = await glassdoorList(links[i], browserInstance, category);
            else if (siteName == "simplyhired")
                data = await simplyHiredList(links[i], browserInstance, category);
            console.table(data);
            let fpath = path.join(folderPath, siteName + ".xlsx")
            excelWriter(fpath, data, "First");
        }

    } catch (err) {
        console.log(err);
    } finally{
        await browserInstance.close();
    }
}

module.exports = {
    jobFn: JobFn
}