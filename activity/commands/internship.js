let fs = require("fs");
let xlsx = require("xlsx");
let path = require("path");
let puppeteer = require("puppeteer");
let links = ["https://www.internshala.com/internships/", "https://www.hellointern.com/search"];

async function internshalaList(link, browserInstance, category) {
    let newTab = await browserInstance.newPage();
    await newTab.goto(link);
    await newTab.click("input[placeholder='What are you looking for?']");
    await newTab.type("input[placeholder='eg. MBA, Android, Mumbai, etc.']", category, { delay: 100 });
    await newTab.keyboard.press("Enter");
    await new Promise((resolve, reject) => setTimeout(resolve, 2000));
    await newTab.click("#close_popup");
    await new Promise((resolve, reject) => setTimeout(resolve, 2000));

    function extractData() {
        let companyNameArr = document.querySelectorAll(".heading_6.company_name");
        let profileNameArr = document.querySelectorAll(".heading_4_5.profile");
        let otherDetailsArr = document.querySelectorAll(".internship_other_details_container");
        let linkArr = document.querySelectorAll(".view_detail_button");
        let details = [];
        for (let i = 0; i < 5; i++) {
            if (companyNameArr[i] && profileNameArr[i] && otherDetailsArr[i]) {
                let Company = companyNameArr[i].innerText;
                let Profile = profileNameArr[i].innerText;
                let detailArr = otherDetailsArr[i].innerText.split("\n");
                let obj = { Company, Profile }
                for (let j = 0; j < detailArr.length; j += 2) {
                    let key = detailArr[j];
                    obj[key] = detailArr[j + 1].trim();
                }
                obj.Link = "https://internshala.com/" + linkArr[i + 2].getAttribute("href").trim();
                details.push(obj);
            }
        }
        return details;
    }
    return await newTab.evaluate(extractData);
}

async function helloInternList(link, browserInstance, category) {
    let newTab = await browserInstance.newPage();
    await newTab.goto(link);
    await newTab.type("#job_title", category, { delay: 100 });
    await newTab.keyboard.press("Enter");
    await new Promise((resolve, reject) => setTimeout(resolve, 2000));

    function extractData() {
        let companyName = document.querySelectorAll(".name_span");
        let profileName = document.querySelectorAll(".title_span");
        let stipendArr = document.querySelectorAll(".salary_span");
        let startDateArr = document.querySelectorAll(".salary_span");
        let endDateArr = document.querySelectorAll(".location_span");
        let linkArr = document.querySelectorAll(".action_apply a");
        let details = [];
        for (let i = 0, j = 0; i < 5; i++, j += 2) {
            let Company = companyName[i].innerText;
            let Profile = profileName[i].innerText;
            let Stipend = stipendArr[j].innerText;
            let StartDate = startDateArr[j + 1].innerText.split(": ")[1];
            let EndDate = endDateArr[j + 1].innerText.split(": ")[1];
            let obj = { Company, Profile, Stipend, StartDate, EndDate };
            // console.log(linkArr);
            // let link = linkArr[i + 1].getAttribute("href");
            // obj.Link = link;
            obj.Link = "https://www.hellointern.com/" + linkArr[1].getAttribute("href");;

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

async function InternFn(cmd, category, dirpath) {
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
            if (siteName == "internshala")
                data = await internshalaList(links[i], browserInstance, category);
            else if (siteName == "hellointern")
                data = await helloInternList(links[i], browserInstance, category);
            console.table(data);
            let fpath = path.join(folderPath, siteName + ".xlsx")
            excelWriter(fpath, data, "First");
        }

    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    internFn: InternFn
}