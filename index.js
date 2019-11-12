const inquirer = require("inquirer");
const util = require("util");
const fs = require("fs");
// const pdf = require("html-pdf");
const axios = require("axios");
const HTML5ToPDF = require("html5-to-pdf");
const path = require("path");

const writeFileAsync = util.promisify(fs.writeFile);

const createPDF = async () => {
  const html5ToPDF = new HTML5ToPDF({
    inputPath: path.join(__dirname, "./temp.html"),
    outputPath: path.join(__dirname, "./touchdown.pdf"),
    // templatePath: path.join(__dirname, "templates", "basic"),
    include: [
      path.join(__dirname, "./node_modules/frow/dist/frow.min.css"),
      path.join(__dirname, "./styles.css")
    ]
  });

  await html5ToPDF.start();
  await html5ToPDF.build();
  await html5ToPDF.close();
  console.log("DONE");
  process.exit(0);
};

inquirer
  .prompt([
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
        console.log(res);
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
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <link rel="stylesheet" href="node_modules/frow/dist/frow.min.css" />
    <link rel="stylesheet" href="./styles.css" />
    <link
      href="https://fonts.googleapis.com/css?family=Montserrat:500,700&display=swap"
      rel="stylesheet"
    />
    <title>Document</title>
  </head>
  <body>
    <header class="frow row-center shadow-light">
      <div>Profile Generator</div>
    </header>
    <div class="frow-container text-center">
      <h1>
        Hello ${urlData.name}!
      </h1>
      <img class="shadow-light profile-image"
        src="${urlData.image}"
      />
      <div>
       location: ${urlData.userlocation}
      </div>
      <div class="frow content-around">
        <div class="col-md-1-3 card">
          ${urlData.userRepo} repos
        </div>
        <div class="col-md-1-3 card">
          ${urlData.numFollower} followers
        </div>
        <div class="col-md-1-3 card">
         Following: ${urlData.numFollowing} people
        </div>
      </div>
    </div>
  </body>
</html>`;

        return writeFileAsync("temp.html", writtenFIle);
      })
      .then(() => {
        console.log("look left");
        return createPDF();
      })
      .catch(err => {
        console.log(err);
      });
  });
// .then(() => {
//   // Because async functions are promises under the hood we can treat the run function as a promise

// })
// .catch(err => {
//   console.log(err);
// });
// .catch(handleErrors);

// Promise.resolve("something")
//   .then(result => {
//     return doSomething(result);
//   })
//   .then(result => {
//     // Because async functions are promises under the hood we can treat the run function as a promise
//     return run();
//   })
//   .catch(handleErrors);

// // // Usage in try/catch block
// try {
//   run();
// } catch (error) {
//   console.error(error);
// }
