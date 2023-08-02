const mongoose = require('mongoose')



const Token = mongoose.Schema({
    userid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        unique : true
    },
    token :{
        type : String,
        required : true
    },
    created_At :{
        type : Date,
        default : Date.now,
        expires: 3600
    }
})

module.exports = mongoose.model('Token',Token)