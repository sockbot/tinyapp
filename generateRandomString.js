const generateRandomString = function (numChars) {
  const allowedChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let randomStr = '';
  for (let i = 0; i < numChars; i++) {
    const randomNum = Math.floor(Math.random() * allowedChars.length);
    const randomChar = allowedChars[randomNum];
    randomStr += randomChar;
  }
  // console.log(randomStr);
  return randomStr;
}

// let i = 0;
// while (i < 100) {
//   generateRandomString(6);
//   i++;
// }

module.exports = { generateRandomString };