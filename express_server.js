const express = require('express');
const { 
  generateRandomString, 
  getUserIdFromEmail, 
  getUserObj, 
  isLoggedIn, 
  urlsForUser,
  shortURLExists
} = require('./helperFunctions.js');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extender: true }));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['lkdsfjlds','sdlkfjldskj','lsdkfjdl'],
  maxAge: 24 * 60 * 60 * 1000
}));
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

// Root redirect
app.get('/', (req, res) => {
  let userid = req.session.user_id;
  if (isLoggedIn(users, userid)) {
    return res.redirect('/urls');
  }
  return res.redirect('/login');
})

// Read single URL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURLExists(urlDatabase, shortURL)) {
    const longURL = urlDatabase[shortURL].longURL;
    return res.redirect(longURL);
  }
  res.redirect(404, '/login');
});

// Add new URL
app.get('/urls/new', (req, res) => {
  let templateVars = {};
  templateVars.user = getUserObj(users, req.session.user_id);
  if (isLoggedIn(users, req.session.user_id)) {
    return res.render('urls_new', templateVars);
  }
  res.redirect('/login');
});

// Render individual short URL edit page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userid = req.session.user_id;
  if (urlDatabase[shortURL] === undefined) {
    res.status(404).send('Short URL not found');
  } else if (isLoggedIn(users, userid) && (urlDatabase[shortURL].user_id === userid)) {
    let templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].longURL,
    };
    templateVars.user = getUserObj(users, req.session.user_id);
    return res.render('urls_show', templateVars);
  } else {
    res.redirect(403, '/login');
  }
});

// Browse all URLS
app.get('/urls', (req, res) => {
  if (isLoggedIn(users, req.session.user_id)) {
    let templateVars = {
      urls: urlsForUser(urlDatabase, req.session.user_id),
    };
    templateVars.user = getUserObj(users, req.session.user_id);
    return res.render('urls_index.ejs', templateVars);
  }
  res.redirect(403, '/login');
});

// Edit existing URL
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

// Create new URL
app.post('/urls', (req, res) => {
  const randomStr = generateRandomString(6);
  urlDatabase[randomStr] = {
    longURL: req.body.longURL,
    user_id: req.session.user_id
  }
  res.redirect(`/urls/${randomStr}`);
});

// Delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const userid = req.session.user_id;
  const shortURL = req.params.shortURL;
  const userURLs = urlsForUser(urlDatabase, userid);
  if (isLoggedIn(users, userid) && (Object.keys(userURLs).indexOf(shortURL)) >= 0) {
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  }
  res.redirect(403, '/login')
});

// Login
app.post('/login', (req, res) => {
  const userid = getUserIdFromEmail(users, req.body.email);
  if (userid && (bcrypt.compareSync(req.body.password, users[userid].hashedPassword))) {
  req.session.user_id = userid;
    res.redirect('/urls');
  } else {
    res.redirect(403, '/login');
  }
});

// Render login page
app.get('/login', (req, res) => {
  let templateVars = {};
  templateVars.user = getUserObj(users, req.session.user_id);
  if (isLoggedIn(users, req.session.user_id)) {
    return res.redirect('/urls')
  }
  res.render('login.ejs', templateVars);
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/login');
});

// Render register page
app.get('/register', (req, res) => {
  let templateVars = {};
  templateVars.user = getUserObj(users, req.session.user_id);
  if (isLoggedIn(users, req.session.user_id)) {
    return res.redirect('/urls')
  }
  res.render('register.ejs', templateVars);
});

// Register new account
app.post('/register', (req, res) => {
  const userid = generateRandomString(10);
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (email === '' || hashedPassword === '') {
    res.sendStatus(404);
  } else if (getUserIdFromEmail(users, email)) {
    res.sendStatus(400);
  } else {
    users[userid] = { userid, email, hashedPassword };
    req.session.user_id = userid
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});