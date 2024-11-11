const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('./passport.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
require('dotenv').config();




console.log(passport)


const app = express();

app.use(
    cors({        
        origin:[
            'http://localhost:3006',
            'http://localhost:8000'
            
        ], 
        credentials: true,
    })
);

app.set('trust proxy', 1);


app.use((req, res, next) => {
    // res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Origin', `${process.env.LOCAL_FRONTEND}`);
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(session({
    secret: `${process.env.GOOGLE_CREDENTIALS_SECRET}SESSION_SECRET`,
    resave: false,
    saveUninitialized: true,
    // cookie: {
    //     secure: true, // Set to true if using HTTPS
    //     sameSite: 'None', // Or 'none' if using cross-site cookies with secure: true
    //     maxAge: 24 * 60 * 60 * 1000
    //   },
      cookie: {
        secure: false, // Set to true if using HTTPS
        sameSite: 'lax', // Or 'none' if using cross-site cookies with secure: true
        maxAge: 24 * 60 * 60 * 1000
      },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        collectionName: 'sessions'
      })
  }));
  

    
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
    console.log("HELLO THEREEEEEE")
    console.log('SESSION',req.session);
    console.log('sessionID', req.sessionID);
    console.log('USER', req.user);
  //   res.json({message: "You are not logged in"})
    
  //   res.status(200).send('YAY!')
})
    
app.get("/failed", (req, res) => {
    res.send("Failed")
})

app.get("/success", (req, res) => {
    res.redirect(`Welcome ${req.user.email}`)
})

app.get('/google',
    passport.authenticate('google', {
            scope:
                ['email', 'profile'],
                keepSessionInfo: true
        }
    ));

    app.get('/google/callback',
      passport.authenticate('google', {
       
          failureRedirect: '/failed',
          keepSessionInfo: true
      }),
      function (req, res) {
          console.log(req.user + " HERE'S THE AUTHENTICATED USER");
       
              res.redirect(
                   `${process.env.LOCAL_FRONTEND}/home`
              );
          
      }
  );

  app.get("/account",  (req, res) => {
      console.log(req.user + "ACCOUNT ROUTE");
      if (req.user) {
          const user = {
              ...req.user,
              loggedIn: true,
            };
            res.json(user);
      }
      else {
        res.json({ loggedIn: false });
      }
      
    });
 

app.get('/logout', function(req, res){
  console.log("logout")
  req.logout((err)=>{
      if(err){
      res.json({message: err})
      } else {
          const user = {
              ...req.user,
              loggedIn: false,
            };
            res.json(user);            }

  });
});




const mongoConnectionString = (process.env.MONGO_URL);


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoConnectionString,
  {
    dbName: "template-mern-google-oauth2-passport",
  }
  );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}


connectDB().then(() => {
    app.listen(8000, () => {
        console.log("listening for requests");
    })
})
 