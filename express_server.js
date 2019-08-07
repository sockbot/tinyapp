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
}

// READ
app.get('/u/:shortURL', (req, res) => {
  // console.log(req.params);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// ADD
app.get('/urls/new', (req, res) => {
  let templateVars = {
    username: req.cookies.username,
    // shortURL: generateRandomString(6)
  };
  res.render('urls_new', templateVars);
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


app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const randomStr = generateRandomString(6);
  urlDatabase[randomStr] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${randomStr}`);
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

// REGISTER
app.get('/register', (req, res) => {
  let templateVars = {
    username: ''
  }
  res.render('login.ejs', templateVars)
})

app.post('/register', (req, res) => {
  const id = generateRandomString(10);
  const { email, password } = req.body;
  users[id] = { id, email, password };
  res.cookie('user_id', id)
  console.log(users)
  res.redirect('/urls');  
})

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