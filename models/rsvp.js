const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rsvpSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    status: {type: String, required: [true,'RSVP cannot be empty'], enum:{values:['yes','no','maybe'], 
    message:"RSVP value can be 'yes', 'no', or 'maybe'"}},
    connection: {type: Schema.Types.ObjectId, ref: 'Connection'}
});

module.exports = mongoose.model('Rsvp', rsvpSchema)
