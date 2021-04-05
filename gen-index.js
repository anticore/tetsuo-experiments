const { readdirSync, writeFileSync, existsSync } = require("fs");
const path = require("path");
const getDirectories = (source) =>
    readdirSync(source, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

// get list of experiment directories and sort inverse alphabetically
let experimentDirs = getDirectories("./experiments").sort(function (a, b) {
    if (a < b) {
        return 1;
    }
    if (a > b) {
        return -1;
    }
    return 0;
});

// generate html from list of experiments
const gen = (experiments) => /* html */ `
    <html>
        <head>
            <title>tetsuo experiments</title>

            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.2/css/bulma.min.css">

            <style>
            </style>
        </head>

        <body class="has-background-black">
            

            <div class="container">
                <div class="header section">
                    <h1 class="title has-text-light ">tetsuo experiments</h1>
                    <h2 class="subtitle has-text-light ">webgl experiments made using the <a href="https://github.com/SolidSolutionsDev/tetsuo">tetsuo framework</a></h2>
                </div>

                <div class="columns">
                    ${experiments
                        .filter((e) => !!e.thumb)
                        .reduce(
                            (content, experiment) =>
                                content +
                                /* html */ `
                            <div class="column is-one-third">
                                <figure class="image is-fullwidth">
                                    <a href=${experiment.link}>
                                        <img src=${experiment.thumb}>
                                    </a>
                                </figure>
                            </div>
                        `,
                            ""
                        )}
                </div>
            </div>
        </body>
    </html>
`;

let experiments = experimentDirs.map((dir) => {
    let thumb = path.join("experiments", dir, "thumb.png");
    let link = path.join("experiments", dir, "index.html");

    return {
        thumb: existsSync(thumb) ? thumb : null,
        link,
    };
});

const html = gen(experiments);

writeFileSync("index.html", html);
