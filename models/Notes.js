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
        default : 'general'
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    date_created :{
        type : Date,
        default :Date.now
    },
    
  });

module.exports = mongoose.model('Notes',notesSchema);