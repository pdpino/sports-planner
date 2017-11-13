import jsonRequest from './index';

export default {
  async get(playerId) {
    return jsonRequest(`/players/${playerId}/comments`);
  },
  async postComment(playerId, commentData = {}) {
    return jsonRequest(`/players/${playerId}/comments/`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
  },
  async deleteComment(playerId, commentId) {
    return jsonRequest(`/players/${playerId}/comments/${commentId}`, {
      method: 'delete',
    });
  },
};
