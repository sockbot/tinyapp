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
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extender: true }));
app.use(morgan('dev'));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  secret: 'alksdglkasdjglasdjdlksjflksdjgh',
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

// root redirect
// if user is logged in:
// (Minor) redirect to /urls
// if user is not logged in:
// (Minor) redirect to /login
app.get('/', (req, res) => {
  let userid = req.session.user_id;
  if (isLoggedIn(users, userid)) {
    return res.redirect('/urls');
  }
  return res.redirect('/login');
})

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
  templateVars.user = getUserObj(users, req.session.user_id);
  if (isLoggedIn(users, req.session.user_id)) {
    return res.render('urls_new', templateVars);
  }
  res.redirect('/login');
});

// render individual short url edit page
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
    console.log('Userid:', userid)
    console.log('urlDatabase[shortURL].user_id:', urlDatabase[shortURL].user_id)
    return res.render('urls_show', templateVars);
  } else {
    res.redirect(403, '/login');
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// BROWSE
app.get('/urls', (req, res) => {
  // console.log(req.session)
  if (isLoggedIn(users, req.session.user_id)) {
    let templateVars = {
      urls: urlsForUser(urlDatabase, req.session.user_id),
    };
    templateVars.user = getUserObj(users, req.session.user_id);
    // console.log(templateVars);
    return res.render('urls_index.ejs', templateVars);
  }
  res.redirect(403, '/login');
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
    user_id: req.session.user_id
  }
  // console.log(urlDatabase);
  res.redirect(`/urls/${randomStr}`);
});

// DELETE
app.post('/urls/:shortURL/delete', (req, res) => {
  const userid = req.session.user_id;
  const shortURL = req.params.shortURL;
  const userURLs = urlsForUser(urlDatabase, userid);
  console.log("Before:", urlDatabase);
  if (isLoggedIn(users, userid) && (Object.keys(userURLs).indexOf(shortURL)) >= 0) {
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
  // console.log(bcrypt.hashSync(req.body.password, 10));
  if (userid && (bcrypt.compareSync(req.body.password, users[userid].hashedPassword))) {
  req.session.user_id = userid;
    res.redirect('/urls');
  } else {
    res.redirect(403, '/login');
  }
});

// render login page
app.get('/login', (req, res) => {
  let templateVars = {};
  templateVars.user = getUserObj(users, req.session.user_id);
  if (isLoggedIn(users, req.session.user_id)) {
    return res.redirect('/urls')
  }
  res.render('login.ejs', templateVars);
});

// LOGOUT
app.post('/logout', (req, res) => {
  // clear login cookie
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/urls');
});

// render register page
app.get('/register', (req, res) => {
  let templateVars = {};
  templateVars.user = getUserObj(users, req.session.user_id);
  if (isLoggedIn(users, req.session.user_id)) {
    return res.redirect('/urls')
  }
  res.render('register.ejs', templateVars);
});

// register new account
app.post('/register', (req, res) => {
  const userid = generateRandomString(10);
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (email === '' || hashedPassword === '') {
    res.sendStatus(404);
  } else if (getUseridFromEmail(users, email)) {
    res.sendStatus(400);
  } else {
    users[userid] = { userid, email, hashedPassword };
    req.session.user_id = userid
    console.log(users);
    res.redirect('/urls');
  }
});

// app.get('*', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});