const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// const cookieParser = require("cookie-parser");
// app.use(cookieParser());

const cookieSession = require("cookie-session");
const { request } = require("express");
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));



// -----------------------FUNCTIONS---------------------------------
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


function isPersonalUrl(database, id) {
  let personalUrls = {};
  for (let data in database) {
    if (database[data].userID === id) {
      personalUrls[data] = database[data];
    }
  }
  return personalUrls;
}
// -----------------------------------------------------------------



const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID"},
  "c8Tm5c": { longURL: "http://www.cnet.com", userID: "user2RandomID"},
  "k6Tf9V": { longURL: "http://www.tsn.ca", userID: "user"}
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
  },
  "user": {
    id: "user",
    email: "user@user.com",
    password: "user"
  },
};



//------------------------Home route-------------------------
app.get("/", (req, res) => {
  res.redirect("/login");
});
// -------------------------------------------------------------


// ---------------Login With email and Password--------------
app.get("/login", (req, res) => {
  let templateVars = { 
    user: req.session.user_id
  };
  if (req.session.user_id) {
    res.redirect("/urls")
  }
  res.render("login", templateVars);
});


app.post("/login", (req, res) => {
const email = req.body.email;
const password = req.body.password;
const user = checkForExistingEmail(users, email);
if (user && user.password === password){
  console.log("user------->>>>>", user)
  req.session.user_id = user.id;
  res.redirect("/urls")
} else {
    res.redirect("/register");
  }
});
// -----------------------------------------------------------------



// -----------------------------Logout Route---------------------------
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});
// ----------------------------------------------------------------------



// ---------------------Register Route------------------------------
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
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

    res.redirect("/urls");
  }
});
// -------------------------------------------------------------------



// ----------------------See All Urls Route-------------------------------
// Route to see all urls
app.get("/urls", (req, res) => {
  let cookieId = req.session["user_id"]
  if (!cookieId) {
    res.redirect("/login")
  } else {
    let templateVars = { 
      urls: isPersonalUrl(urlDatabase, cookieId),  //here to change with function
      user: users[cookieId] };
    res.render("urls_index", templateVars);
  }
});


// app.get("/urls", (req, res) => {
// const cookieId = req.session["user_id"]
// if (!cookieId) {
//   res.redirect("/login")
// } else {
//   let templateVars = { urls: urlDatabase, user: users[cookieId] };
//   res.render("urls_index", templateVars);
// }
// });

app.post("/urls", (req, res) => {
  let cookieId = req.session["user_id"]
  if (!cookieId) {
    res.redirect("/login")
  } else {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {longURL: req.body.longURL, userID: cookieId}
    // console.log(urlDatabase);
    res.redirect(`urls/${shortURL}`);
  }
});
// --------------------------------------------------------------------------



//  --------------------Create new short url Route------------------------


app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = { 
      user: users[req.session.user_id]
    }
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
})


//-----new
app.post("/urls", (req, res) => {
  let cookieId = req.session["user_id"]
  const shortString = generateRandomString();
  urlDatabase[shortString] = {
    longURL: req.body.longURL,
    userID: cookieId
  }
  res.redirect(`/urls/${shortString}`)
})
// ------------------------------------------------------------------------




// ---------------------Modify an url Route------------------------------
app.get("/urls/:shortURL/modify", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL/modify", (req, res) => {
  // console.log(req.body);
  // console.log(urlDatabase);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls`);
});
// ----------------------------------------------------------------------



//-----------------------Delete an url Route----------------------------
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
// ---------------------------------------------------------------------




//---------------------Show specific long url Route------------------------
//1st shortURL is linked to the show.ejs file
app.get("/urls/:shortURL", (req, res) => {
  //req.params is linked to the app.get url name
  if (users[req.session.user_id]) {
    let url = urlDatabase[req.params.shortURL]
    if (req.session.user_id === url.userID) {
        let templateVars = { 
        shortURL: req.params.shortURL,
        longURL: url.longURL, 
        user: users[req.session.user_id]
      };
      return res.render("urls_show", templateVars);
    } else {
      return res.status(403).send("Unautorize access");
    }
  } else {
    return res.status(403).send("You are not logged in")
  }
});
//--------------------------------------------------------------------------




//---------------------------Say Hello Route----------------------------
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//----------------------------------------------------------------------



app.get("/u/:shortURL", (req, res) => {
  // console.log(urlDatabase[req.params.shortURL].longURL);
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});





// Start server on port with message
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});