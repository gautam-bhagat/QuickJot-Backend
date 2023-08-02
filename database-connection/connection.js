const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://quickjot-admin:QuickJotAdmin@cluster0.ycliqbl.mongodb.net/?retryWrites=true&w=majority';
// const mongoURI = 'mongodb://127.0.0.1:27017/QuickJot?directConnection=true';

const connectToMongo = () =>{
    mongoose.connect(mongoURI,{}).then(()=>{
        console.log("Connected !!");
        
    }).catch(err => console.log(err))
}
 
module.exports = connectToMongo;