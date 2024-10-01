const express = require("express");
const app = express();
const mongoose = require('mongoose');
const multer  = require('multer')
const User = require('./models/user.js');
const Photo = require('./models/photo.js');
const Video = require('./models/video.js');
const path = require('path');
const methodOverride = require("method-override");


const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://gazinghubsolution:GHS123@ghs.tcwso.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=GHS");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

connectDB();

app.use(methodOverride("_method"));

app.use(express.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, "/views")));

// Set the directory for views
app.set('views', path.join(__dirname, 'views'));

// Set up multer storage engine
const storage = multer.diskStorage({
    destination: './views/uploads',
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  // Init upload middleware
  const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // Limit file size to 10MB
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    }
  }).single('image'); // Only allow one file upload with the field name 'image'
  
  // Check file type (only allow image files)
  function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
  
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }

  app.get("/", (req, res, next) => {
    res.render("./index.ejs");
  });
  
  // Route to display the photo upload form
  app.get("/photo", (req, res) => {
      res.render('./photo'); // Make sure you have a photo.ejs view file in the views directory
  });
  
  // Handle photo upload and save file info to the database
  app.post("/photo", upload, async (req, res) => {
      if (!req.file) {
          return res.send('No file uploaded!');
      }
  
      try {
        console.log(req.file);
        const image = {filename : req.file.filename , url : req.file.path}
          const photo = new Photo({
              image : image,
              duration : 5,
          });
  
          await photo.save();
          res.redirect('/');
      } catch (error) {
          console.error("Error saving photo to the database:", error);
          res.status(500).send('Error saving photo to the database');
      }
  });
  

app.get("/photo", (req, res, next) => {
    res.render('./photo.ejs');
});

app.get("/photo/:id", async (req, res, next) => {
  let { id } = req.params;
  let ad = await Photo.findById(id);
  res.render('./showImg.ejs', {ad});
});

app.delete("/photo/:id", async (req, res, next) => {
  let { id } = req.params;
  let del = await Photo.findByIdAndDelete(id);
  console.log(del);
  res.redirect('/');
});

app.get("/video", (req, res, next) => {
    res.render('./video.ejs');
});

app.get("/video/:id", async (req, res, next) => {
  let { id } = req.params;
  let ad = await Video.findById(id);
  res.render('./showVid.ejs', {ad});
});

app.delete("/video/:id", async (req, res, next) => {
  let { id } = req.params;
  let del = await Video.findByIdAndDelete(id);
  console.log(del);
  res.redirect('/');
});

app.post("/video", async (req, res, next) => {
    const { video } = req.body;
    const newVid = new Video({
        video : video,
    });
    console.log(newVid);
    await newVid.save();
    res.redirect('/');
});

app.get('/screen', async (req, res, next) => {
    const photos = await Photo.find({});
    const images = photos.map(photo => photo.image.filename);
    const vid = await Video.find({});
    const videos = vid.map(video => video.video.url);
    const imageid = photos.map(photo => photo.image._id);
    const videoid = vid.map(video => video.video._id);
    res.render('./screen.ejs', { vid, photos });
    // res.send({ vid, photos });
})

app.listen(8080, () => {
    console.log("App is Listining to 8080 port");
});

