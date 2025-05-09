// filepath: models/Invite.js
const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema({
    party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        required: true
    },
    inviter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inviteeEmail: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Invite', InviteSchema);