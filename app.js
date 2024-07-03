const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('myFile');

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Files of this type are not allowed!');
  }
}

// EJS
app.set('view engine', 'ejs');

// Public folder
app.use(express.static('./public'));

app.get('/', (req, res) => res.render('index'));

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render('index', { msg: err });
    } else {
      if (req.file == undefined) {
        res.render('index', { msg: 'No file selected!' });
      } else {
        res.render('index', { msg: 'File uploaded!', file: `uploads/${req.file.filename}` });
      }
    }
  });
});

// List uploaded files
app.get('/files', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      res.status(500).send('Error reading directory');
    } else {
      res.render('files', { files: files });
    }
  });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
