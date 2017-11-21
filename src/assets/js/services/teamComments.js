import jsonRequest from './index';

export default {
  async get(teamId, isPublic) {
    const condition = isPublic ? 'public' : 'private';
    return jsonRequest(`/teams/${teamId}/comments/${condition}`);
  },
  async postComment(teamId, isPublic, commentData = {}) {
    commentData.isPublic = isPublic;
    return jsonRequest(`/teams/${teamId}/comments/`, {
      method: 'post',
      sendJson: true,
      body: JSON.stringify(commentData),
    });
  },
  async deleteComment(teamId, commentId) {
    return jsonRequest(`/teams/${teamId}/comments/${commentId}`, {
      method: 'delete',
    });
  },
};
