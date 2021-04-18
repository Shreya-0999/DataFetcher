let {internFn} = require("./commands/internship");
let {courseFn} = require("./commands/course");
let input = process.argv.slice(2);
let cmd = input[0];
let category = input[1];
let dirpath = "D:\\Study\\Pepcoding\\Hackathons\\Project 1\\Output";
switch(cmd){
    case "internship":
        internFn(cmd, category, dirpath);
        break;
    
    case "course":
        courseFn(cmd, category, dirpath);
        break;
    
    default: console.log("Wrong Command");
}