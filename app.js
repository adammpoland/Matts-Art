const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const hostURL = 'http://localhost:5001/';
const app = express();
var methodOverride = require('method-override');

//promise
mongoose.Promise = global.Promise;
const keys = require('./config/keys');

//connet to mongoose
mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true
})
    .then(() => console.log('Mongo is connected'))
    .catch(err => console.log(err));


// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))
    //body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


//load ideamodel
require('./models/ideas');

const Idea = mongoose.model('ideas');

//set storage engiene
const storage = multer.diskStorage({
    destination: './public/uploads/',
   
    filename: function (req, file, cb) {
        cb(null, file.originalname);
        // cb(null,file.originalname+ '-' + Date.now() + path.extname(file.originalname));

    }
});

//init upload
const upload = multer({
    storage: storage
}).single('myFile');


//starts ejs
app.set('view engine', 'ejs');

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/views", express.static(path.join(__dirname, 'views')));

app.use(express.static("./views"));




app.get('/', (req, res) => {

    //DATABASE TO ARRAY
    Idea.find({}, (err, ideas) => {
        if (err) return console.log(err);

        res.render('index', { ideas: ideas });
    });
});


app.get('/uploader', (req, res) => {
        res.render('uploader',);
});

app.post('/upload', (req, res) => {
    try {
        upload(req, res, (err) => {
            if (err) {
                console.log("err");
    
                console.log(err);
    
                res.render('index', {
                    msg: err
                    
                });
    
            } else {
                if (req.file == undefined) {
                    console.log(req.file);
    
                    res.render('index', {
                        msg: 'Error no file selected'
                    });
                } else {
                    console.log("the fuck?");
    
                    const newUser={
                        title: req.file.filename,
                        //details: req.body.details
    
                    }
                    new Idea(newUser)
                        .save()
    
                    Idea.find({}, (err, ideas) => {
                        if (err) return console.log(err);
                
                        res.writeHead(301,
                            {Location: hostURL}
                          );
                        res.end();
                    });
                   
    
    
                }
            }
        })
    } catch (error) {
        
    }
   
});



//for downloads
app.get('/download', function (req, res) {
    try {
        let file = __dirname + '/public/uploads/'+req.body.title;
    console.log(file);
    res.download(file); // Set disposition and send it.
    } catch (error) {
        
    }
    
});


app.post('/deleteFile', (req, res) =>{
    try {
        var path = 'public/uploads/'+req.body.fileName;
    fs.unlinkSync(path);
    Idea.deleteOne({
        _id: req.body.deleteFile
    }).then(Idea.find({}, (err, ideas) => {
        if (err) return console.log(err);
        
        res.writeHead(301,
            {Location: hostURL}
          );
        res.end();
    }));
    } catch (error) {
        console.log(error);
    }
    
});




const port = 5001;

app.listen(port, () => console.log('server started on 5001'));
