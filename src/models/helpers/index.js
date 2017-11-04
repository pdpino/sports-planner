const _ = require('lodash');

/** Return a function that applies callable to results **/
function getHookFunction(callable){
  return function applyOnResults(result, options){
    if(!result){
      return;
    }

    if(result.constructor == Array) {
      for (let i = 0; i < result.length; i++) {
        callable(result[i]);
      }
    } else {
      callable(result);
    }
  }
}

/** Copy user info (email, names and photo) into person (player or owner) object, so is more accesible **/
const copyUserInfo = getHookFunction(function (person){
  Object.assign(person, _.pick(person.user, 'firstName', 'lastName', 'email', 'photo'));
});

module.exports = {
  getHookFunction,
  copyUserInfo,
}
