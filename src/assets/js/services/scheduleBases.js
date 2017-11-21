import jsonRequest from './index';

export default {
  async get(compoundId,fieldId) {
    return jsonRequest(`/compounds/${compoundId}/fields/${fieldId}/scheduleBases/edit`);
  },
  async postComment(compoundId, fieldId, commentData = {}) {
    commentData.isPublic = isPublic;
    return jsonRequest(`/compounds/${compoundId}/fields/${fieldId}/scheduleBases/edit`, {
      method: 'post',
      sendJson: true,
      body: JSON.stringify(commentData),
    });
  },
};
