const mongoose = require('mongoose');

const userLocationSchema = new mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location : {
        type : {
            type : String,
            default: 'Point'
        },
        coordinates: {
            type : [Number],
        }
    }
},{timestamps:true});

userLocationSchema.index({location : '2dsphere'});
const UserLocation = mongoose.model('UserLocation', userLocationSchema);
module.exports = UserLocation;