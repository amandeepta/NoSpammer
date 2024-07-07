require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const authRoute = require("./routes/authRoutes");
const cookieSession = require("cookie-session");
const passportStrategy = require("./passport");
const app = express();
const session = require('express-session');
const emailAuth = require('./routes/emailRoutes');
const dbConnect = require('./config/dataBase');

app.use(
	cookieSession({
		name: "session",
		keys: ["somesessionkey"],
		maxAge: 24 * 60 * 60 * 100,
	})
);
app.use(express.json());

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
  }));

app.use(passport.initialize());
app.use(passport.session());
const corsOptions = {
	origin: [
	  "http://localhost:5173",
	  "https://accounts.google.com",
	  "http://localhost:5000"
	],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true
  };
  
  app.use(cors(corsOptions));
  
app.use("/auth", authRoute);
app.use("/emails", emailAuth);
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listenting on port ${port}...`));
dbConnect();