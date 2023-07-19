import mongoose from 'mongoose';

const mongoose = require('mongoose')
const {Schema} = mongoose.Schema;


const userSchema = new Schema({
    name : {
        type : String,
        require : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    username : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    date_created :{
        type : Date,
        default :Date.now
    },
    
  });

module.exports = mongoose.model('User',userSchema);