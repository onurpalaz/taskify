let express = require("express");
let mongodb = require("mongodb").MongoClient;
require("dotenv").config();

let app = express();
let db;

let connectionString =
  "mongodb+srv://" +
  process.env.DB_USER +
  ":" +
  process.env.DB_PASS +
  "@" +
  process.env.DB_HOST;
mongodb.connect(
  connectionString,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  function (err, client) {
    db = client.db();
    app.listen(3000);
  }
);

app.use(express.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  db.collection("tasks")
    .find()
    .toArray(function (err, tasks) {
      res.send(`
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Taskify</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.5.0/css/all.min.css" integrity="sha512-QfDd74mlg8afgSqm3Vq2Q65e9b3xMhJB4GZ9OcHDVy1hZ6pqBJPWWnMsKDXM7NINoKqJANNGBuVRIpIJ5dogfA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
        </head>
        <body>
            <div class="container is-widescreen px-4">
                <div class="is-flex is-justify-content-center is-align-items-center py-6 px-3">
                  <span class="fa-stack fa-2x mr-3">
                    <i class="fas fa-circle fa-stack-2x has-text-info"></i>
                    <i class="fas fa-tasks fa-stack-1x has-text-white"></i>
                  </span>
                  <span>
                    <h1 class="title is-1">TASKIFY</h1>
                  </span>
                </div>
                <div class="has-background-light p-5">
                  <form action="/add-task" method="POST">
                      <div class="columns">
                        <div class="column is-four-fifths">
                          <input name="task" autofocus autocomplete="off" class="input" type="text">
                        </div>
                        <div class="column is-one-fifth">
                          <a class="button is-info is-fullwidth">
                          <i class="fas fa-plus-circle mr-3"></i>
                          <span>
                            Add New Task
                          </span>
                          </a>
                        </div>
                      </div>
                  </form>
                </div>
                
                <ul class="mt-5">
                    ${tasks
                      .map(function (task) {
                        return `<li class="box is-flex is-justify-content-space-between is-align-items-center mb-3">
                        <span class="is-family-primary has-text-weight-semibold is-capitalized">${task.text}</span>
                        <div>
                        <button class="button is-warning">Edit</button>
                        <button class="button is-danger">Delete</button>
                        </div>
                    </li>`;
                      })
                      .join("")}
                </ul>
            </div>
        </body>
    </html>
    `);
    });
});

app.post("/add-task", function (req, res) {
  db.collection("tasks").insertOne({ text: req.body.task }, function () {
    res.redirect("/");
  });
});
