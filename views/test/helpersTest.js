const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers, 1)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return a user with valid password', function() {
    const user = getUserByEmail("user2@example.com", testUsers, 2)
    const expectedOutput = "dishwasher-funk";
    assert.equal(user, expectedOutput);
  });

  it('should return undefined when email not on database', function() {
    const user = getUserByEmail("user@ample.com", testUsers, 1)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });


});
