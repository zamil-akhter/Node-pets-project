const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    petName:String,
    gender : {
        type : String,
        enum : ['male', 'female'],
        default: null
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location : {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates : {
            type : [Number],
        },
    }
},{timestamps:true});
petSchema.index({location : '2dsphere'});
const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;