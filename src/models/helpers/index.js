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

/** Wrapper to get one element of a many-associated model (hasMany or belongsToMany) **/
async function findOneAssociatedById(entity, getter, id) {
  // example: findOneAssociatedById(match, 'getPlayers', playerId)
  const elements = await entity[getter]({ where: { id } });
  return (elements.length === 1) ? elements[0] : null;

  // NOTE: if the getter is a function instead of a string, then this should be done first:
  // const bindedGetter = getter.bind(entity);
  // to bind the 'this' element to the entity
}

module.exports = {
  getHookFunction,
  copyUserInfo,
  findOneAssociatedById,
}
