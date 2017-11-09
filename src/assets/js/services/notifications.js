import jsonRequest from './index';

export default {
  async get(userId) {
    return jsonRequest(`/users/${userId}/notifications`);
  }
};
