const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const UrlSchema = new Schema({
    url:{
        type: String,
        required: true
    },
    notes:{
        type: String,
        required: true
    },
    categorie:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('urls', UrlSchema)