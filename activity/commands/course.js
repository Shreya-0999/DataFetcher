let fs = require("fs");
let xlsx = require("xlsx");
let path = require("path");
let puppeteer = require("puppeteer");
let browserInstance
let links = ["https://www.udemy.com/", "https://www.coursera.org/in", "https://www.linkedin.com/learning/"];

async function udemyList(link, browserInstance, category) {
    let newTab = await browserInstance.newPage();
    await newTab.goto(link);
    await newTab.type("input[placeholder = 'Search for anything']", category, { delay: 100 });
    await newTab.keyboard.press("Enter");
    await new Promise((resolve, reject) => setTimeout(resolve, 3000));

    function extractData() {
        let courseNameArr = document.querySelectorAll(".udlite-focus-visible-target.udlite-heading-md.course-card--course-title--2f7tE");
        let providerArr = document.querySelectorAll(".udlite-text-xs.course-card--instructor-list--lIA4f");
        let ratingArr = document.querySelectorAll(".udlite-heading-sm.star-rating--rating-number--3lVe8");
        let priceArr = document.querySelectorAll(".price-text--price-part--Tu6MH.course-card--discount-price--3TaBk.udlite-heading-md");
        let linkArr = document.querySelectorAll(".udlite-custom-focus-visible.browse-course-card--link--3KIkQ");
        let details = [];
        for (let i = 0; i < 10; i++) {
            if (courseNameArr[i] && providerArr[i] && ratingArr[i] && priceArr[i] && linkArr[i]) {
                let Name = courseNameArr[i].innerText;
                let Provider = providerArr[i].innerText;
                let Rating = ratingArr[i].innerText;
                let Price = priceArr[i].innerText.split("\n")[1];
                let obj = { Name, Provider, Rating, Price };
                obj.Link = "https://www.udemy.com/" + linkArr[i].getAttribute("href").trim();
                details.push(obj);
            }
        }
        return details;
    }
    return await newTab.evaluate(extractData);
}

async function courseraList(link, browserInstance, category) {
    let newTab = await browserInstance.newPage();
    await newTab.goto(link);
    await newTab.click(".nostyle.search-button .magnifier-wrapper")
    await new Promise((resolve, reject) => setTimeout(resolve, 2000));
    await newTab.type("input[placeholder='What do you want to learn?']", category, { delay: 100 });
    await newTab.keyboard.press("Enter");
    await new Promise((resolve, reject) => setTimeout(resolve, 2000));

    function extractData() {
        let courseNameArr = document.querySelectorAll(".color-primary-text.card-title.headline-1-text");
        let providerArr = document.querySelectorAll(".partner-name.m-b-1s");
        let ratingArr = document.querySelectorAll(".rc-Ratings.horizontal-box .ratings-text");
        let levelArr = document.querySelectorAll(".product-difficulty .difficulty");
        let details = [];
        for (let i = 0; i < 10; i++) {
            if (courseNameArr[i]) {
                let Name = courseNameArr[i].innerText;
                let Provider = providerArr[i].innerText;
                let Rating = ratingArr[i].innerText;
                let Level = levelArr[i].innerText;
                let obj = { Name, Provider, Rating, Level };
                details.push(obj);
            }
        }
        return details;
    }
    return await newTab.evaluate(extractData);
}

async function linkedInList(link, browserInstance, category) {
    let newTab = await browserInstance.newPage();
    await newTab.goto(link);
    await newTab.type("input[placeholder = 'Search skills, subjects, or software']", category, { delay: 100 });
    await newTab.keyboard.press("Enter");
    await new Promise((resolve, reject) => setTimeout(resolve, 2000));

    function extractData() {
        let courseNameArr = document.querySelectorAll(".base-search-card__title");
        let providerArr = document.querySelectorAll(".base-search-card__subtitle");
        let durationArr = document.querySelectorAll(".search-entity-media__duration");
        let linkArr = document.querySelectorAll(".results-list__item a");
        let details = [];
        for (let i = 0; i < 10; i++) {
            if (courseNameArr[i]) {
                let Name = courseNameArr[i].innerText;
                let Provider = providerArr[i].innerText;
                let Duration = durationArr[i + 1].innerText;
                let Link = linkArr[i].getAttribute("href").trim();
                let obj = { Name, Provider, Duration, Link };
                details.push(obj);
            }
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

async function CourseFn(cmd, category, dirpath) {

    try {
        browserInstance = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized",]
        });

        let folderPath = path.join(dirpath, cmd);
        dirCreator(folderPath);          
        for (let i = 0; i < links.length; i++) {
            let siteName = links[i].split(".")[1];
            let data = "";
            if (siteName == "udemy")
                data = await udemyList(links[i], browserInstance, category);
            else if (siteName == "coursera")
                data = await courseraList(links[i], browserInstance, category);
            else if (siteName == "linkedin")
                data = await linkedInList(links[i], browserInstance, category);
            console.table(data);
            let fpath = path.join(folderPath, siteName + ".xlsx")
            excelWriter(fpath, data, "First");
        } 

    } catch (err) {
        console.log(err);
    }
    finally {
        await browserInstance.close();
    }

};

module.exports = {
    courseFn: CourseFn
}