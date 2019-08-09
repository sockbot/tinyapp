const generateRandomString = function(numChars) {
  const allowedChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let randomStr = '';
  for (let i = 0; i < numChars; i++) {
    const randomNum = Math.floor(Math.random() * allowedChars.length);
    const randomChar = allowedChars[randomNum];
    randomStr += randomChar;
  }
  return randomStr;
};

const getUserIdFromEmail = function(usersObj, email) {
  for (const userId in usersObj) {
    if (usersObj[userId].email === email) {
      return userId;
    }
  }
  return undefined;
};

const getUserObj = function(usersObj, userId) {
  if (usersObj[userId]) {
    return usersObj[userId];
  }
  return {
    id: '',
    email: '',
    password: '',
  };
};

const isLoggedIn = function(users, userId) {
  if (Object.keys(users).indexOf(userId) >= 0) {
    return true;
  }
  return false;
};

const urlsForUser = function(urlIds, id) {
  let urls = {};
  for (let urlId in urlIds) {
    if (urlIds[urlId].user_id === id) {
      urls[urlId] = urlIds[urlId];
    }
  }
  return urls;
};

const shortURLExists = function(urlIds, shortURL) {
  return Object.keys(urlIds).indexOf(shortURL) >= 0;
}

module.exports = { generateRandomString, getUserIdFromEmail, getUserObj, isLoggedIn, urlsForUser, shortURLExists };