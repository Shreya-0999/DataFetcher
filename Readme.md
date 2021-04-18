# DataFetcher
## Table of Contents
1. [General Info](#general-info)
2. [Installation](#installation)

### General Info
***
This project will help you to find the data related to internships and course materials according to the command passed. 
1. **node main.js internship "Web Development"**  :: If the *internship* command is passed then it will scrape the available internship data from the domain passed i.e Web development 
from the websites (Internshala and HelloIntern) and will make an excel file holding up the data fetched.

2. **node main.js course "Web Development"**  :: If the *course* command is passed then it will find and scrape the courses that are providing the course passed in the command i.e Web development 
from the websites (Udemy, Coursera and LinkedIn Learning) and will make an excel file that will contain the data fetched.
***

## Installation
***
A little intro about the installation. 
$ npm install puppeteer
$ npm install xlsx
***