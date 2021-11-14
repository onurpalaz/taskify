let express = require("express");
let MongoClient = require("mongodb").MongoClient;
let ObjectId = require("mongodb").ObjectId;
let sanitizeHTML = require("sanitize-html");

require("dotenv").config();

let app = express();
let db;

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.use(express.static("public"));

let connectionString =
  "mongodb+srv://" +
  process.env.DB_USER +
  ":" +
  process.env.DB_PASS +
  "@" +
  process.env.DB_HOST;

MongoClient.connect(
  connectionString,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, client) => {
    db = client.db();
    app.listen(port);
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

function passwordProtected(req, res, next) {
  res.set("WWW-Authenticate", "Basic realm='Simple Todo App'");
  // Login Credentials => Username: username & Password: password
  if (req.headers.authorization == "Basic dXNlcm5hbWU6cGFzc3dvcmQ=") {
    next();
  } else {
    res.status(401).send("Authentication required");
  }
}

app.use(passwordProtected);

app.get("/", (req, res) => {
  db.collection("tasks")
    .find()
    .toArray((err, tasks) => {
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
                  <form id="task-form" action="/add-task" method="POST">
                      <div class="columns">
                        <div class="column is-four-fifths">
                          <input id="task-field" name="task" autofocus autocomplete="off" class="input" type="text">
                        </div>
                        <div class="column is-one-fifth">
                          <button class="button is-info is-fullwidth">
                            <i class="fas fa-plus-circle mr-3"></i>
                            <span>
                              Add New Task
                            </span>
                          </button>
                        </div>
                      </div>
                  </form>
                </div>
                
                <ul id="task-list" class="mt-5">
                    
                </ul>
            </div>
            <script>
            let tasks = ${JSON.stringify(tasks)}
            </script>
            <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
            <script src="/browser.js"></script>
        </body>
    </html>
    `);
    });
});

app.post("/add-task", (req, res) => {
  let safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {},
  });
  db.collection("tasks").insertOne({ text: safeText }, (err, info) => {
    res.json({ _id: info.insertedId.toString(), text: req.body.text });
  });
});

app.post("/update-task", (req, res) => {
  let safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {},
  });
  db.collection("tasks").findOneAndUpdate(
    { _id: ObjectId(req.body.id) },
    { $set: { text: safeText } },
    () => {
      res.send("Success");
    }
  );
});

app.post("/delete-task", (req, res) => {
  db.collection("tasks").deleteOne({ _id: ObjectId(req.body.id) }, () => {
    res.send("Success");
  });
});
