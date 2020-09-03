const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());



// -------------FUNCTIONS---------------------

function generateRandomString() {
  let number = Math.random().toString(36).substr(2, 6);
  return number;
}

function checkForExistingEmail(users, email) {
  for (let userKey in users) {
    let user = users[userKey]
    console.log("user", user)
    if (user.email === email) {
      
      return user;
    }
  }
  return false;
}

function checkMatchingEmailPassword(users, password) {
  for (let user in users){
    console.log(users[user].password)
    if (users[user].password === password) {

      return true;
    }
  }
  return false;
}
// ------------------------------------------------------------


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


// ---------------Login With email and Password--------------
// --------------------------------------------------------------
app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["username"]] };
  res.render("login", templateVars);
});


app.post("/login", (req, res) => {
const email = req.body.email;
const password = req.body.password;
const user = checkForExistingEmail(users, email);
if (user && user.password === password){
res.cookie('user_id', user.id);
res.redirect("/urls")
} else {
    res.sendStatus(403);
  }
});
// -----------------------------------------------------------------



// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});


// -------------------------------------
// Register
app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["username"]] };
  res.render("register", templateVars);
});


app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  } else if (checkForExistingEmail(users, req.body.email)) {
    res.sendStatus(404);
  } else {
    let id = generateRandomString();
    let email = req.body.email;
    let password = req.body.password;
    users[id] = {
      id: id,
      email: email,
      password: password
    }
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});

// app.get('/register', (req, res) => {
//   res.render('register');
// });
// ------------------------------------------


// Home route
app.get("/", (req, res) => {
  res.send("Hello!");
});


// Route to see all urls
app.get("/urls", (req, res) => {
  const cookieId = req.cookies["user_id"]
  let templateVars = { urls: urlDatabase, user: users[cookieId] };
  console.log("test TempVara", templateVars)
  console.log("test CookieId", cookieId)
  res.render("urls_index", templateVars);
});



//  --------------------Create new short url get and post----------------
// ----------------------------------------------------------------------

// Route to page form to create a new short url
app.get("/urls/new", (req, res) => {
  const cookieId = req.cookies["username"]
  let templateVars = { urls: urlDatabase, user: users[cookieId] };
  res.render("urls_new", templateVars);
});

// Create new short url and redirect to the page from this new url
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  console.log(urlDatabase);
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`urls/${randomString}`);
});
// --------------------------------------------------------------------



// Route to get specific long url info with the short url info
//1st shortURL is linked to the show.ejs file
app.get("/urls/:shortURL", (req, res) => {
  //req.params is linked to the app.get url name
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], urls: urlDatabase, user: users[req.cookies["username"]]};
  res.render("urls_show", templateVars);
  console.log(req.params);
});


app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Route to /hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// Delete an url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


// ---------------------------------------------------
// Modify an url
app.get("/urls/:shortURL/modify", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL/modify", (req, res) => {
  console.log(req.body);
  console.log(urlDatabase);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls`);
});
// ------------------------------------------------------


// Start server on port with message
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});