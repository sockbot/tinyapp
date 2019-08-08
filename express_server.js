const express = require('express');
const { 
  generateRandomString, 
  getUseridFromEmail, 
  getUserObj, 
  isLoggedIn, 
  urlsForUser,
  shortURLExists
} = require('./helperFunctions.js');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extender: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', user_id: "userRandomID" },
  '9sm5xK': { longURL: 'http://www.google.com', user_id: "user2RandomID" },
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: "$2b$10$jddq6u6YZDTS67Tb0QrZNe9IQS8lUuU75309oQ31lSGQGcbYYcOSi"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: "$2b$10$c0G9q2G7oBfzxEfx0Z0niOl1s/Cz/KHiULVIrx0Q7iq7U9vFt0qYS"
  }
};

// READ
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURLExists(urlDatabase, shortURL)) {
    const longURL = urlDatabase[shortURL].longURL;
    return res.redirect(longURL);
  }
  res.redirect(404, '/login');
});

// ADD
app.get('/urls/new', (req, res) => {
  let templateVars = {};
  templateVars.user = getUserObj(users, req.cookies.user_id);
  // console.log(req.cookies.user_id);
  // console.log(Object.keys(users))
  if (isLoggedIn(users, req.cookies.user_id)) {
    return res.render('urls_new', templateVars);
  }
  res.redirect('/login');
});

// render individual short url edit page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userid = req.cookies.user_id;
  if (urlDatabase[shortURL] === undefined) {
    res.status(404).send('Short URL not found');
  } else if (isLoggedIn(users, userid) && (urlDatabase[shortURL].user_id === userid)) {
    let templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].longURL,
    };
    templateVars.user = getUserObj(users, req.cookies.user_id);
    return res.render('urls_show', templateVars);
  }
  // res.status(400).send('hello world');
  res.redirect(403, '/login');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// BROWSE
app.get('/urls', (req, res) => {
  if (isLoggedIn(users, req.cookies.user_id)) {
    let templateVars = {
      urls: urlsForUser(urlDatabase, req.cookies.user_id),
    };
    templateVars.user = getUserObj(users, req.cookies.user_id);
    console.log(templateVars);
    return res.render('urls_index.ejs', templateVars);
  }
  res.redirect('/login');
});

// edit existing URL
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

// create new URL
app.post('/urls', (req, res) => {
  const randomStr = generateRandomString(6);
  urlDatabase[randomStr] = {
    longURL: req.body.longURL,
    user_id: req.cookies.user_id
  }
  // console.log(urlDatabase);
  res.redirect(`/urls/${randomStr}`);
});

// DELETE
app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.cookies.user_id;
  const shortURL = req.params.shortURL;
  const userURLs = urlsForUser(urlDatabase, userId);
  console.log("Before:", urlDatabase);
  if (isLoggedIn(users, userId) && (Object.keys(userURLs).indexOf(shortURL)) >= 0) {
    delete urlDatabase[shortURL];
    console.log("After:", urlDatabase);
    return res.redirect('/urls');
  }
  console.log("After:", urlDatabase);
  res.redirect(403, '/login')
});

// LOGIN
app.post('/login', (req, res) => {
  // lookup email address and check password
  const userid = getUseridFromEmail(users, req.body.email);
  // if (userid && (users[userid].hashedPassword === req.body.password)) {
  console.log(bcrypt.hashSync(req.body.password, 10));
  if (userid && (bcrypt.compareSync(req.body.password, users[userid].hashedPassword))) {
  res.cookie('user_id', userid);
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

// render login page
app.get('/login', (req, res) => {
  let templateVars = {};
  templateVars.user = getUserObj(users, req.cookies.user_id);
  res.render('login.ejs', templateVars);
});

// LOGOUT
app.post('/logout', (req, res) => {
  // clear login cookie
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// render register page
app.get('/register', (req, res) => {
  let templateVars = {};
  templateVars.user = getUserObj(users, req.cookies.user_id);
  res.render('register.ejs', templateVars);
});

// register new account
app.post('/register', (req, res) => {
  const id = generateRandomString(10);
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (email === '' || hashedPassword === '') {
    res.sendStatus(404);
  } else if (getUseridFromEmail(users, email)) {
    res.sendStatus(400);
  } else {
    users[id] = { id, email, hashedPassword };
    res.cookie('user_id', id);
    console.log(users);
    res.redirect('/urls');
  }
});

// app.get('*', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

// app.get('/hello', (req, res) => {
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });
 
// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});