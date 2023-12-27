const express = require('express');
const app = express();
const path = require('node:path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const Razorpay = require('razorpay');
let file = {
  path: 'path/to/your/file'
};
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
     cb(null, 'public/images'); // Use 'public/images' instead of '/public/images'
  },
  filename: (req, file, cb) => {
     cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').pop());
  }
 });
const upload = multer({ storage: storage });
app.use((req, res, next)=>{
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
  })


app.use(session({
    secret: ['your-secret-key','utiu','jkgliuygfuiyj','jhwhhwuhdhw',], // Replace with your secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if using HTTPS
  }));
 const checkBlocked = (req, res, next) => {
    const isBlocked = req.session.user && req.session.user.isBlocked;

    if (isBlocked) {
        
        req.session.user = null; // Clear user information
        req.session.destroy(); // Clear the session
        return res.render('login', { message: 'Your account is blocked. Please contact support.' });
    }

    next(); // Move to the next middleware or route
};

// Apply the middleware globally to check for blocked users
app.use(checkBlocked);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/public/uploads/', express.static('public'));

app.use('/', require('./routes/userRoutes'));
app.use('/admin', require('./routes/adminRoute'));
app.use('/admin', require('./routes/manageRoute'));




//database
const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017")
.then(()=> console.log('database connection successful'))
.catch((err)=>console.error("Error:", err.message));
// Create a route to render your HTML template



// ... Rest of your code


app.listen(3000, ()=>{
    console.log('Listening to port http://localhost:3000');
})