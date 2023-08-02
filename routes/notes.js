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

    let success = false;

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json({ success, error: validationErrors });
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
      success = true
      res.json({success, saved});
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3 : update an existing note
notesrouter.put("/updatenote", fetchuser, async (req, res) => {
  const { _id,title, description, tag } = req.body;

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
  let success = false
  //find the note to be updated
  let note = await Notes.findById(_id);

  if (!note) {
    return res.status(404).json({success, "message" : "Not Found"});
  }

  if (note.user.toString() !== req.userid) {
    return res.status(401).json({success , message : "Unauthorized Access"});
  }

  note = await Notes.findByIdAndUpdate(
    _id,
    { $set: newNote },
    { new: true }
  );

  success = true

  res.json({success, note});
});


//delete note
notesrouter.delete("/deletenote", fetchuser, async (req, res) => {
  try {
    let note = await Notes.findById(req.body.id);

    success = false

    if (!note) {
      return res.status(404).json({success , message : "not found"});
    }

    if (note.user.toString() !== req.userid) {
      return res.status(401).json({success , message : "Unauthorized Access"});
    }

    success = true
    note = await Notes.findByIdAndDelete(req.body.id);
    res.json({success , note});
  } catch (error) {
    console.log(error);
    res.status(500).json({success : false,message :"Internal Server Error"});
  }
});

module.exports = notesrouter;
