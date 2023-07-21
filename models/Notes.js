const mongoose = require('mongoose')


const notesSchema = mongoose.Schema({
    title : {
        type : String,
        require : true
    },
    description : {
        type : String,
        
    },
    tag : {
        type : String,
        default : 'General'
    },
    date_created :{
        type : Date,
        default :Date.now
    },
    
  });

module.exports = mongoose.model('Notes',notesSchema);