const path = require('path');
const { Base } = require('./Base');
const Datastore = require('nedb-promises');

/*
{
  _id: "string",
  userId: "string"
  username: "string",
  data: Object
}
*/

class LastLocation extends Base {
  ___datastore;

  static datastore() {
    const datastore = Datastore.create({
      filename: path.join('data', 'lastlocations.db'),
      timestampData: true
    });
    this.___datastore = datastore;
    return datastore;
  }

  static async create(data, user, deviceId) {
    await LastLocation.remove({ userId: user._id }, { multi: true }, function (err, numRemoved) {
      // numRemoved = 1
    });
    const lastlocation = new LastLocation({
      userId: user._id,
      username: user.username,
      deviceId,
      data
    });
    await lastlocation.save();
    this.__datastore.persistence.compactDatafile();
    return lastlocation;
  }

  static async getLastByUserId(userId) {
    const locations = [];
    (await LastLocation.find({ userId }).sort({ createdAt: -1 })).forEach((loc) => {
      if (!locations.find((location) => location.deviceId === loc.deviceId)) {
        locations.push(loc);
      }
    });
    return locations;
  }
}

module.exports.LastLocation = LastLocation;
