const express = require("express");
const path = require("path");
const notes = require("./db/db.json");
const { readFromFile, writeToFile, readAndAppend } = require("./helpers/fsUtils");
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId({length:6});

const app = express();
const PORT = process.env.PORT || 3001;
const db = "./db/db.json";

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get("/api/notes", (req, res) => {
  let savedNotes;
  readFromFile(db)
  .then((data) => {
    savedNotes = JSON.parse(data)
  }).then( () => {
    res.json(savedNotes);
  });
});

app.post("/api/notes", (req, res) => {
  const newNotes = {
    ...req.body, 
    id: uid.rnd()
  };
  readAndAppend(newNotes, db)
  res.end();
});

app.delete("/api/notes/:id", (req ,res) => {
  readFromFile(db)
  .then((data) => {
    const savedNotes = JSON.parse(data);
    const delIndex = savedNotes.findIndex((note) => note.id === req.params.id);
    if (delIndex != -1) savedNotes.splice(delIndex, 1);
    return savedNotes;
  }).then((newNotes) => {
    writeToFile(db, newNotes);
    res.end();
  });
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);

