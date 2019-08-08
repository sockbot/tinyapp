const { assert } = require('chai');
const { getUseridFromEmail } = require('../helperFunctions.js');

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

describe('#getUserIdByEmail', () => {
  it('should return a userid with valid email', () => {
    const userid = getUseridFromEmail(users, 'user@example.com')
    const expectedOutput = "userRandomID";
    assert.equal(userid, expectedOutput);
  })

  it('should return false with an invalid email', () => {
    const userid = getUseridFromEmail(users, 'flksdjflk@lksdjfldk.com');
    const expectedOutput = undefined;
    assert.equal(userid, expectedOutput);
  })
})