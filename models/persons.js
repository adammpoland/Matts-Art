const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PersonSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    pic:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: false
    },
    email:{
        type: String,
        required: false
    },
    notes:[{
       note: {
           type:String,
           required: true
       },
       date: {
        type: Date,
        default: Date.now
        }   
    }],
    
    date: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('persons', PersonSchema)