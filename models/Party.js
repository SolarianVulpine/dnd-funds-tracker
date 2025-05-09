// filepath: models/Party.js
const mongoose = require('mongoose');

const PartySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        name: String,
        funds: {
            pp: { type: Number, default: 0 },
            gp: { type: Number, default: 0 },
            ep: { type: Number, default: 0 },
            sp: { type: Number, default: 0 },
            cp: { type: Number, default: 0 }
        }
    }],
    groupFunds: {
        pp: { type: Number, default: 0 },
        gp: { type: Number, default: 0 },
        ep: { type: Number, default: 0 },
        sp: { type: Number, default: 0 },
        cp: { type: Number, default: 0 }
    },
    invites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invite'
    }]
});

module.exports = mongoose.model('Party', PartySchema);