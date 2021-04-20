# DataFetcher
## Table of Contents
1. [Description](#description)
2. [Installation](#installation)

### Description
***
With the help of automation this project will help one to find the data related to internships jobs and course materials that are available in any particular domain and make an excel file containing all the data related to that course or internship. The commands to be passed are:
1. **node main.js internship "Web Development"**  :: If the *internship* command is passed then it will scrape the available internship data from the domain passed i.e Web development from the websites (Internshala and HelloIntern) and will make an excel file holding up the data fetched.

2. **node main.js course "Web Development"**  :: If the *course* command is passed then it will find and scrape the courses that are providing the course passed in the command i.e Web development from the websites (Udemy, Coursera and LinkedIn Learning) and will make an excel file that will contain the data fetched.

3. **node main.js job "Software Engineer"**  :: If the *job* command is passed then it will find and scrape the jobs that are available in the specific field given. The website used for scraping are *Glassdoor* and *Simply Hired*.
***

### Installation
***
The libraries that I have installed are:
```
$ npm install puppeteer
$ npm install xlsx
```
***
