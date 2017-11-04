const cloudinary = require('cloudinary');

class FileStorage {
  constructor() {
    cloudinary.config({
      cloud_name: 'kamehouse',
      api_key: '264471899394447',
      api_secret: 'CxfheqosKH4seUDycyFpmJSlMZU'
      })
    }
    upload(fileData, name) {
       cloudinary.uploader.upload(fileData.path, function(result) {
      console.log(result);
        },
        {public_id: name,invalidate: true});
    }
    url (name, options){
      return cloudinary.url(name, options )
    }
    destroy (name){
      return cloudinary.uploader.destroy(name)
    }
  }

module.exports = new FileStorage();
