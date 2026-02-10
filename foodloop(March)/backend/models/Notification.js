const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['Farmer', 'Buyer']
    },
    type: {
        type: String,
        required: true,
        enum: ['NEW_ORDER', 'ORDER_STATUS_UPDATE', 'PAYMENT_UPDATE', 'SYSTEM']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    metadata: {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        externalId: String
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
