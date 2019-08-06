const express = require('express');
const { generateRandomString } = require('./generateRandomString');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extender: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.set('view engine', 'ejs');

let templateVars = {
  
};

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
  'aj38di': 'http://www.sockbot.com'
};

// READ
app.get('/u/:shortURL', (req, res) => {
  // console.log(req.params);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// BROWSE
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render('urls_index.ejs', templateVars);
});

// ADD
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls', templateVars);
});

app.post('/urls', (req, res) => {
  const randomStr = generateRandomString(6);
  urlDatabase[randomStr] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${randomStr}`);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    username: req.cookies.username
  };
  res.render('urls_new', templateVars);
});

// DELETE
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// LOGIN
app.post('/login', (req, res) => {
  // set cookie "username" to req.body.username
  console.log(req.body.username);
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

// LOGOUT
app.post('/logout', (req, res) => {
  // clear username cookie
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('*', (req, res) => {
  res.redirect('/urls');
});

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
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