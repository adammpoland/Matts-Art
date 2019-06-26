const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const hostURL = 'http://159.89.157.220:5001/';
const app = express();


var https = require('https');


// This line is from the Node.js HTTPS documentation.
var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};




//promise
mongoose.Promise = global.Promise;
const keys = require('./config/keys');

//connet to mongoose
mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true
})
    .then(() => console.log('Mongo is connected'))
    .catch(err => console.log(err));


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

const stripe = require('stripe')('sk_test_WJqXGrriFnn8htYvtoymCslA');


app.get('/checkout', (req, res) => {
    res.render('checkout');
})

app.post('/charge', (req, res) => {

    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys

    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    const token = req.body.stripeToken; // Using Express
    console.log(token);
    var buyerInfo = {
        fName: req.body.fName,
        lName: req.body.lName,
        sAddress: req.body.sAddress,
        sState: req.body.sState,
        sCity: req.body.sCity,
        sZip: req.body.sZip
    }
 
    console.log(buyerInfo);
    
    (async () => {
        const charge = await stripe.charges.create({
            amount: 400,
            currency: 'usd',
            description: 'book',
            source: token,
        });
        Idea.find({}, (err, ideas) => {
            if (err) return console.log(err);
    
            res.render('index', { ideas: ideas });
        });
    })();
})



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

//app.listen(port, () => console.log('server started on 5001'));
https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  }, app)
  .listen(3000, function () {
    console.log('Example app listening on port 3000! Go to https://localhost:3000/')
  })
console.log('server started on ' + port)
