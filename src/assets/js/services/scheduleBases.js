import jsonRequest from './index';

export default {
  async get(isPublic,fieldId) {
    return jsonRequest(`/compounds/${compoundId}/${fieldId}/scheduleBases/`);
  },
  async postComment(teamId, isPublic, commentData = {}) {
    commentData.isPublic = isPublic;
    return jsonRequest(`/teams/${teamId}/comments/`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
  },
  async deleteComment(teamId, commentId) {
    return jsonRequest(`/teams/${teamId}/comments/${commentId}`, {
      method: 'delete',
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
