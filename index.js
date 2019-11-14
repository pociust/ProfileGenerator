const inquirer = require("inquirer");
const util = require("util");
const fs = require("fs");
const axios = require("axios");
const HTML5ToPDF = require("html5-to-pdf");
const path = require("path");
const writeFileAsync = util.promisify(fs.writeFile);
const themes = {
  red: {
    main: "#E57373",
    light: "#FFCDD2",
    dark: "#D32F2F"
  },
  orange: {
    main: "#FB8C00",
    light: "#FFCC80",
    dark: "#EF6C00"
  },
  green: {
    main: "#00897B",
    light: "#B2DFDB",
    dark: "#00695C"
  },
  blue: {
    main: "#2196F3",
    light: "#90CAF9",
    dark: "#0D47A1"
  },
  purple: {
    main: "#5E35B1",
    light: "#9575CD",
    dark: "#4527A0"
  },

  black: {
    main: "#727272",
    light: "#eee",
    dark: "#333"
  },
  teal: {
    main: "#26A69A",
    light: "#B2DFDB",
    dark: "#004D40"
  },
  brown: {
    main: "#795548",
    light: "#D7CCC8",
    dark: "#3E2723"
  }
};

const changeTheme = color => {
  console.log("color", color);
  fs.appendFile('./styles.css', `
  :root {
    --theme-color: ${themes[color].main};
    --theme-color-light:${themes[color].light};
    --theme-color-dark: ${themes[color].dark};
  }`, function (err) {
    if (err) throw err;
    console.log('Updated!');
  });
// "--theme-color", themes[color].main);
//document.documentElement.style.setProperty("--theme-color", themes[color].main)
//   "--theme-color-light",
// document.documentElement.style.setProperty(
//   "--theme-color-light",
//   themes[color].light
// );
// document.documentElement.style.setProperty(
//   "--theme-color-dark",
//   themes[color].dark
// );
};
const addRepoStars = repos =>
  repos.reduce(
    (accumulator, currentValue) => accumulator + currentValue.stargazers_count,
    0
  );

const createPDF = async () => {
  const html5ToPDF = new HTML5ToPDF({
    inputPath: path.join(__dirname, "./temp.html"),
    outputPath: path.join(__dirname, "./touchdown.pdf"),
    include: [
      path.join(__dirname, "./node_modules/frow/dist/frow.min.css"),
      path.join(__dirname, "./styles.css")
    ],
    options: { printBackground: true }
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
      name: "username",
      default: "pociust"
    },
    {
      type: "rawlist",
      name: "color",
      message: "what is your favorite color?",
      choices: [
        "red",
        "orange",
        "green",
        "blue",
        "purple",
        "black",
        "teal",
        "brown"
      ]
    }
  ])
  .then(answer => {
    const queryUrl = `https://api.github.com/users/${answer.username}`;
    console.log("answer", answer);
    changeTheme(answer.color);
    axios
      .get(queryUrl)
      .then(res => {
        // console.log(res);
        let urlData = {
          name: res.data.name,
          userlocation: res.data.location,
          image: res.data.avatar_url,
          userRepo: res.data.public_repos,
          numFollower: res.data.followers,
          numFollowing: res.data.following
        };
        // console.log(urlData);
        return urlData;
      })
      .then(urlData => {
        urlData.starGazersCount = axios
          .get(`${queryUrl}/repos?per_page=100`)
          .then(res => {
            let userRepoStar = addRepoStars(res.data);
            return userRepoStar;
          })
          .then(userRepoStar => {
            console.log("stars", userRepoStar);

            const writtenFIle = `
        <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <link rel="stylesheet" href="node_modules/frow/dist/frow.min.css" />
    <link rel="stylesheet" href="./styles.css" />
    <title>ProfileGenerator</title>
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
        <div class="col-xs-1-3 card">
          ${urlData.userRepo} repos
        </div>
        <div class="col-xs-1-3 card">
          ${urlData.numFollower} followers
        </div>
        <div class="col-xs-1-3 card">
         Following: ${urlData.numFollowing} people
        </div>
        <div class="col-xs-1-3 card">
         Stars: ${userRepoStar}
        </div>
      </div>
    </div>
  </body>
</html>`;

            return writeFileAsync("temp.html", writtenFIle);
          });
      })
      .then(() => {
        return createPDF();
      })
      .catch(err => {
        console.log(err);
      });
  });
