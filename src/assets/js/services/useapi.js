import jsonRequest from './index';
const request = require('superagent');

export default {
  async getNearbyCompound(latitude,longitude) {
    return request.get(`https://api.foursquare.com/v2/venues/search?ll=${latitude},${longitude}&radio=5000&client_id=4BOTTWBVDCLLZ15JQSHTPQDQXWO1OV4FHDMZDBJ1FQSQPSTZ&client_secret=PCHSMIGIVKQR5TIPMDUETY1ADFACL1FOGX2EMGH2FX1B5ZES&v=20171120&categoryId=52e81612bcbc57f1066b7a2b,4bf58dd8d48988d1e8941735,4bf58dd8d48988d1e1941735,52e81612bcbc57f1066b7a2f,56aa371be4b08b9a8d57351a,4bf58dd8d48988d1e6941735,58daa1558bbb0b01f18ec1b0,4f452cd44b9081a197eba860,56aa371be4b08b9a8d57352c,5032829591d4c4b30a586d5e,52e81612bcbc57f1066b7a2c,4bf58dd8d48988d167941735,4bf58dd8d48988d168941735,4cce455aebf7b749d5e191f5,52e81612bcbc57f1066b7a2e,52e81612bcbc57f1066b7a2d,4e39a956bd410d7aed40cbc3,4eb1bf013b7b6f98df247e07&limit=50`).query({ format: 'json' })
    ;
  },
  async getDetails(Id) {
    return request.get(`https://api.foursquare.com/v2/venues/${Id}?client_id=4BOTTWBVDCLLZ15JQSHTPQDQXWO1OV4FHDMZDBJ1FQSQPSTZ&client_secret=PCHSMIGIVKQR5TIPMDUETY1ADFACL1FOGX2EMGH2FX1B5ZES&v=20171120`).query({ format: 'json' });

  },

  async postCompound(compoundData) {

    return jsonRequest(`/compounds/`, {
      method: 'post',
      sendJson: true,
      body: JSON.stringify(compoundData),
    });
  },
};
