// server.js
// This is a Note Taker server handles http requests and interact with db.json to read, write and delete notes.  
// required modules: express, path, short-unique-id, ./helpers/fsUtils.js
// note thawt writeToFile is rewritten with writeFileSync.
const express = require("express");
const path = require("path");
const { readFromFile, writeToFile, readAndAppend } = require("./helpers/fsUtils");
const ShortUniqueId = require("short-unique-id");

// initializing global variables
//   uid: the 6 char unique id generator instance
//   app: the express server instance
//   PORT: the port that the server listens on. Either use 3001 or a port specified by the environment
//   db: the path of the database file db.json which contains the existing notes.
const uid = new ShortUniqueId({length:6});
const app = express();
const PORT = process.env.PORT || 3001;
const db = "./db/db.json";

// express middleware to parse json, url encode and redirect the url root request to public.
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route serverURL/ GET request to return /public/index.html 
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// route serverURL/notes GET request to return /public/notes.html 
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// route serverURL/api/notes GET request to return a JSON object that contains notes from db.json 
app.get("/api/notes", (req, res) => {
  readFromFile(db)
  .then((data) => {
    res.json(JSON.parse(data))
  });
});

// route serverURL/api/notes POST request to add a new note with UUID to db.json.
app.post("/api/notes", (req, res) => {
  const {title, text} = req.body;
  if (title && text){
    const newNotes = {
      ...req.body, 
      id: uid.rnd()
    };
    readAndAppend(newNotes, db)
    res.status(200).end();
  } else {
    res.status(400).json("400 bad request missing title or text from req");
  }
});

// route serverURL/api/notes/:id DELETE request to remove a post associated with a specific UUID from db.json.  
// If UUID is not found, it does nothing to db.json and return an error code 400 back to the client.
app.delete("/api/notes/:id", (req ,res) => {
  readFromFile(db)
  .then((data) => {
    const savedNotes = JSON.parse(data);
    const delIndex = savedNotes.findIndex((note) => note.id === req.params.id);
    if (delIndex == -1) throw new Error("400 bad request id " + req.params.id + " not found.");  
    savedNotes.splice(delIndex, 1);
    return savedNotes;
  }).then((newNotes) => {
    writeToFile(db, newNotes);
    res.status(200).end();
  }).catch((err) => {
    res.status(400).json(err.message);
});

});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} if running on local`)
);

