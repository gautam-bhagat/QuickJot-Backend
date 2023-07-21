const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const notesrouter = express.Router();
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// ROUTE 1 : fetch all notes
notesrouter.get("/fetchall", fetchuser, async (req, res) => {
  const notes = await Notes.find({ user: req.userid });
  res.json(notes);
});

// ROUTE 2 : ADD note
notesrouter.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Title must be minimum 3 characters").isLength({ min: 3 }),
    body("description", "Description must be minimum 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json({ error: validationErrors });
    }

    try {
      const { title, description, tag } = req.body;

      const user_id = req.userid;

      const note = new Notes({
        title,
        description,
        tag,
        user: user_id,
      });

      const saved = await note.save();

      res.json(saved);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3 : update an existing note
notesrouter.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;

  //Creating newNote object
  let newNote = {};

  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }
  //

  //find the note to be updated
  let note = await Notes.findById(req.params.id);

  if (!note) {
    return res.status(404).send("not found");
  }

  if (note.user.toString() !== req.userid) {
    return res.status(401).send("Unauthorized Access");
  }

  note = await Notes.findByIdAndUpdate(
    req.params.id,
    { $set: newNote },
    { new: true }
  );
  res.json(note);
});

notesrouter.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    let note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).send("not found");
    }

    if (note.user.toString() !== req.userid) {
      return res.status(401).send("Unauthorized Access");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.send({ Success: "Note has been deleted", note });
  } catch (error) {
    console.log(error);
    res.status(500).status("Internal Server Error");
  }
});

module.exports = notesrouter;
