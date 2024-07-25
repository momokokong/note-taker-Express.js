const express = require("express");
const path = require("path");
const notes = require("./db/db.json");
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId({length:4});

const app = express();
const PORT = process.env.port || 3001;

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
  // console.log(notes);
  res.send(notes);
});

app.post("/api/notes", (req, res) => {
  const newNotes = {
    ...req.body, 
    id: uid.rnd()
  };
  notes.push(newNotes);
  // console.log(notes[2].id);
  res.end();
});

app.delete("/api/notes/:id", (req ,res) => {
  console.log("deleting " + req.params.id);
  const delIndex = notes.findIndex((note) => note.id === req.params.id);
  console.log("deleting " + req.params.id + " index "+ delIndex +"\n");
  if (delIndex) notes.splice(delIndex, 1);
  console.log(notes);
  res.end();
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);

