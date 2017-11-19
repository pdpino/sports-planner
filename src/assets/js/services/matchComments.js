import jsonRequest from './index';

export default {
  async get(matchId) {
    return jsonRequest(`/matches/${matchId}/comments`);
  },
  async postComment(matchId, commentData = {}) {
    return jsonRequest(`/matches/${matchId}/comments/`, {
      method: 'post',
      sendJson: true,
      body: JSON.stringify(commentData),
    });
  },
  async deleteComment(matchId, commentId) {
    return jsonRequest(`/matches/${matchId}/comments/${commentId}`, {
      method: 'delete',
    });
  },
};
