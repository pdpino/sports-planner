import jsonRequest from './index';

export default {
  async get(compoundId,fieldId) {
    return jsonRequest(`/compounds/${compoundId}/${fieldId}/scheduleBases/`);
  },
  async postComment(teamId, isPublic, commentData = {}) {
    commentData.isPublic = isPublic;
    return jsonRequest(`/teams/${teamId}/comments/`, {
      method: 'post',
      sendJson: true,
      body: JSON.stringify(commentData),
    });
  },
};
