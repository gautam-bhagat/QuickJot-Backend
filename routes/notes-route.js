const express = require('express');
const notesrouter = express.Router();

notesrouter.get('/',(req,res)=>{

    res.send('Welcome Notes!');

})

module.exports = notesrouter;