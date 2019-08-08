const generateRandomString = function(numChars) {
  const allowedChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let randomStr = '';
  for (let i = 0; i < numChars; i++) {
    const randomNum = Math.floor(Math.random() * allowedChars.length);
    const randomChar = allowedChars[randomNum];
    randomStr += randomChar;
  }
  // console.log(randomStr);
  return randomStr;
};
// let i = 0;
// while (i < 100) {
//   generateRandomString(6);
//   i++;
// }

const getUseridFromEmail = function(usersObj, email) {
  for (const userid in usersObj) {
    // console.log(usersObj[userid].email);
    if (usersObj[userid].email === email) {
      return userid;
    }
  }
  return false;
};
// const users = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
//   "user2RandomID": {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk"
//   }
// }
// console.log(emailExists(users, 'user2@example.com') === true);
// console.log(emailExists(users, 'dfkdjsfk@kdfldkj.com') === false);

const getUserObj = function(usersObj, userid) {
  if (usersObj[userid]) {
    return usersObj[userid];
  }
  return {
    id: '',
    email: '',
    password: '',
  };
};

const isLoggedIn = function(users, userid) {
  if (Object.keys(users).indexOf(userid) >= 0) {
    return true;
  }
  return false;
};

const urlsForUser = function(urlids, id) {
  let urls = {};
  for (let urlid in urlids) {
    if (urlids[urlid].user_id === id) {
      urls[urlid] = urlids[urlid];
    }
  }
  return urls;
};

const shortURLExists = function(urlids, shortURL) {
  return Object.keys(urlids).indexOf(shortURL) >= 0;
}

module.exports = { generateRandomString, getUseridFromEmail, getUserObj, isLoggedIn, urlsForUser, shortURLExists };