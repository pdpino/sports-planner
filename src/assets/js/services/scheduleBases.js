import jsonRequest from './index';

export default {
  async get(compoundId,fieldId) {
    console.log("AHHHHHHHHHHHHHHHHHHHHHJKSKJASHJS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    return jsonRequest(`/compounds/${compoundId}/fields/${fieldId}/scheduleBases/edit`);
  },
  async postBases(compoundId, fieldId, commentData = {}) {
    console.log("AHHHHHHHHHHHHHHHHHHHHHJKSKJASHJS")
    return jsonRequest(`/compounds/${compoundId}/fields/${fieldId}/scheduleBases/`, {
      method: 'post',
      sendJson: true,
      body: JSON.stringify(commentData),
    });
  },
};
