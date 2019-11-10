const inquirer = require("inquirer");
const util = require("util");
const fs = require("fs");
const pdf = require("html-pdf");
const axios = require("axios");

const writeFileAsync = util.promisify(fs.writeFile);

inquirer
  .prompt([
    {
      type: "input",
      name: "name",
      message: "what is your name?"
    },
    {
      type: "input",
      message: "Enter your GitHub username",
      name: "username"
    },
    {
      type: "input",
      name: "color",
      message: "what is your favorite color?"
    }
  ])
  .then(answer => {
    const queryUrl = `https://api.github.com/users/${answer.username}`;
    axios
      .get(queryUrl)
      .then(res => {
        const profileName = res.data.name;
        const location = res.data.location;
        const profileIMG = res.data.avatar_url;
        const repos = res.data.public_repos;
        const followers = res.data.followers;
        const following = res.data.following;
        const urlData = {
          name: profileName,
          userlocation: location,
          image: profileIMG,
          userRepo: repos,
          numFollower: followers,
          numFollowing: following
        };
        console.log(urlData);
        return urlData;
      })
      .then(urlData => {
        const writtenFIle = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
  </head>
  <body>
  <h1>
    hello ${urlData.name}
  </h1>
  <img src="${urlData.profileIMG}">
  <div>
    location: ${urlData.location}
  </div>
  <div>
    number of repos: ${urlData.userRepo}
  </div>
  <div>
    number of followers: ${urlData.numFollower}
  </div>
  <div>
    numer of people following: ${urlData.numFollowing}
  </div>

  </body>
  </html>`;

        return writeFileAsync("index.html", writtenFIle);
      })
      .then(() => {
        console.log("look left");
      })
      .catch(err => {
        console.log(err);
      });
  })
  .then(() => {
    const html = fs.readFileSync("./index.html", "utf8");
    const options = { format: "Letter" };
    pdf.create(html, options).toFile("./touchdown.pdf", (err, res) => {
      if (err) return console.log(err);
      console.log(res);
    });
  });
