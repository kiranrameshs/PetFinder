// Load modules
const express = require('express');
const Handlebars = require('handlebars')
const expbhs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const methodOverride = require('method-override');
// const multer = require('multer'); 
// const fs = require('fs'); 
// const path = require('path');
const fileUpload = require('express-fileupload');
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');
const AWS_Location = 'https://krspetfinder.s3.ap-south-1.amazonaws.com/';
var finalFileName;







// Connect to MongoURI exported from config
const keys = require('./config/keys');

//Collections
const User = require('./models/user');
const Post = require('./models/post');


require('./passport/google-passport');
require('./passport/facebook-passport');

//Link helpers
const {ensureAuthentication,ensureGuest} = require('./helpers/auth');
const { findOne } = require('./models/user');

// Initialize application
const app = express();

app.use(cookieParser());
app.use(session({ secret: 'keyboard cat',
resave: true,
saveUninitialized: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(fileUpload());


//Global variables for User
app.use( (req,res,next) => {
  res.locals.user = req.user || null;
  next();
});

const s3 = new AWS.S3({
  accessKeyId: keys.AWS_Access_Key,
  secretAccessKey: keys.AWS_Secret_Key
})



// Template engine for view 
app.engine('handlebars',expbhs({defaultLayout: 'main',
handlebars: allowInsecurePrototypeAccess(Handlebars)}));
app.set('view engine', 'handlebars');

// Setup static files to store css, js, images
app.use(express.static('public'));

mongoose.Promise = global.Promise;

//connect to remote db using keys imported above
mongoose.connect(keys.MongoURI, {useNewUrlParser: true})
.then(() => {console.log('Connected to remote db successfully')}).catch(() =>
{console.log(err)});



// server port set as env variable and for local port as 3000
const port = process.env.PORT || 3000;


// route for pages
app.get('/',ensureGuest, (req,res)=>{
    res.render('home')});

app.get('/about',(req,res)=>{
    res.render('about');
});

//Google Auth route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });

  //Handle all users route
  app.get('/users',ensureAuthentication,(req,res)=>{
    User.find({}).then((users) =>{
      res.render('users', 
      {users:users})
    })
});

  //Display one user profile route
  app.get('/user/:id',ensureAuthentication,(req,res)=>{
    User.findById({_id: req.params.id}).then((user) =>{
      res.render('user', 
      {user:user})
    })
});

  //Handle profile route
  app.get('/profile',ensureAuthentication,(req,res)=>{
    Post.find({user: req.user._id})
    .populate('user')
    .sort({date:'desc'})
    .then((posts) =>{
      res.render('profile', {
        posts:posts
      });
    });
});

//Handle add email post route
app.post('/addEmail',(req, res) =>{
  const email = req.body.email;
  User.findById({_id: req.user._id})
  .then((user) =>
  {
    user.email = email;
    user.save()
    .then(() =>{
      res.redirect('/profile');
    })
  })
})

//Handle add Phone number route
app.post('/addPhone', (req, res) => {
  const phoneNumber = req.body.phone;
  User.findById({_id: req.user._id})
  .then((user) =>
  {
    user.phoneNumber = phoneNumber;
    user.save()
    .then(() =>{
      res.redirect('/profile');
    })
  })
})

//Handle add location route
app.post('/addLocation', (req, res) => {
  const location = req.body.location;
  User.findById({_id: req.user._id})
  .then((user) =>
  {
    user.location = location;
    user.save()
    .then(() =>{
      res.redirect('/profile');
    })
  })
})

   //Handle add post route
app.post('/savePost', (req, res) =>{
  
  
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  console.log( req.files);
  let sampleFile = req.files.sampleFile;
  let myFile = sampleFile.name.split(".")
  let fileType = myFile[myFile.length - 1]
  finalFileName = `${uuidv4()}.${fileType}`
  sampleFile.mv('uploads/'+finalFileName, (err) => {
    if (err)
      return res.status(500).send(err);
      
    //res.send('File uploaded!');
  });

  
  const params = {
      Bucket: keys.AWS_Bucket_Name,
      Key: finalFileName,
      Body: sampleFile.data,
      ACL:'public-read'
  }

  s3.upload(params, (error, data) => {
    if(error){
        res.status(500).send(error)
    }
    var url = data.Location
    console.log(url);
})

var allowComments; 
    if(req.body.allowComments){
    allowComments = true
    }
    else{
        allowComments = false
    }


    var result = quickstart('uploads/'+finalFileName);
    var newAnnotation = {
      element:'',
      breed: ''
    }
  
  
    result.then( (result) => {
      //console.log(result) // "Some User token"
     newAnnotation = {
        element:result[0].description,
        firstTag: result[1].description,
        secondtTag: result[2].description,
        thirdTag: result[3].description,
        fourthTag: result[4].description,
      }
      console.log("element is "+ newAnnotation.element)
      console.log("firstTag is "+ newAnnotation.firstTag)
      console.log("secondtTag is "+ newAnnotation.secondtTag)
      console.log("thirdTag is "+ newAnnotation.thirdTag)
      console.log("fourthTag is "+ newAnnotation.fourthTag)

      const newPost = {
        title: req.body.title,
        body: req.body.body, 
        allowComments:allowComments,
        status: req.body.status,
        tag: req.body.tag,
        image: `${AWS_Location}${finalFileName}`,
        user: req.user._id,
        annotation: newAnnotation 
    
      }
      new Post(newPost).save().then(()=>
      {
        
        res.redirect('/posts');
      });
    } 
      
   )
  
  
});

//save image to db


//Handle edit post route
app.get('/edit/Post/:id', (req, res) =>{
  Post.findOne({_id: req.params.id})
  .then((post) => {
    res.render('editingpost', {
      post:post
    });
  });
});

//Handle delete post route
app.delete('/:id', (req, res) =>{
  Post.remove({_id: req.params.id})
  .then(() =>
  {
    res.redirect('/profile');
  });
});

//Handle PUT route to save for edit post
app.put('/editingpost/:id', (req, res) =>
{
  Post.findOne({_id: req.params.id})
  .then((post) =>
  {
    var allowComments;
    if(req.body.allowComments){
      allowComments = true;
    }else{
      allowComments = false;
    }
    post.title = req.body.title;
    post.body = req.body.body;
    post.status = req.body.status;
    post.tag = req.body.tag;
    post.img = req.body.image;
    post.allowComments = allowComments;
    post.save()
    .then(() =>{
      res.redirect('/profile')
    });
  });
});

//handle all (public) posts route
app.get('/posts',ensureAuthentication,(req,res)=>{
    Post.find({status: 'public'})
    .populate('user')
    .populate('comments.commentUser')
    .sort({date: 'desc'}).then((posts)=>{
      res.render('publicposts', {posts:posts});
    });
  });

  //handle all (lost-pet) posts route
app.get('/lostposts',ensureAuthentication,(req,res)=>{
  Post.find({tag: 'lost'})
  .populate('user')
  .populate('comments.commentUser')
  .sort({date: 'desc'}).then((posts)=>{
    res.render('lostposts', {posts:posts});
  });
});


//handle all (found-pet) posts route
app.get('/foundposts',ensureAuthentication,(req,res)=>{
  Post.find({tag: 'found'})
  .populate('user')
  .populate('comments.commentUser')
  .sort({date: 'desc'}).then((posts)=>{
    res.render('foundposts', {posts:posts});
  });
});

  //Handle add comment to public posts - save comments to database
  app.post('/addComment/:id', (req, res) =>
  {
    Post.findOne({_id: req.params.id})
    .then((post) =>{
      const newComment = {
        commentBody: req.body.commentbody,
        commentUser: req.user._id
      }
      post.comments.push(newComment)
      post.save()
      .then(()=> {
        res.redirect('/posts');
      })
    })
  })

//display single user all public posts
app.get('/showposts/:id',(req, res) =>
{
  Post.find({user: req.params.id, status: 'public'})
  .populate('user')
  .sort({date: 'desc'})
  .then((posts) => {
      res.render('showposts', {
        posts: posts
      });
  });
});


//Facebook Auth route
app.get('/auth/facebook',
  passport.authenticate('facebook',{
    scope: 'email'
  }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });

//Handle posts route
app.get('/addpost', (req, res) =>
{
    
  res.render('addpost');
});

//Handle user logout
app.get('/logout', (req, res) =>
{
  req.logOut();
  res.redirect('/');
})


async function quickstart(fullfilename) {
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const clientv = new vision.ImageAnnotatorClient({
      keyFilename: './config/APIKey.json'
  });

  // Performs label detection on the image file
  const [result] = await clientv.labelDetection(fullfilename);
  const labels = result.labelAnnotations;
  // console.log('Labels:');
  // labels.forEach(label => console.log(label.description));
  //console.log(result);
  return labels;

}

    
//success message if server is running
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});