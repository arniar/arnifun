const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
    },
    userId: {
        type: String,
        required: true,
    },
    productId: {
        type: Number,
        required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: String, required: true },
    variant: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Variant', 
        required: true 
    }, 
    orderDate: { type: Date, default: Date.now },
    paymentMethod: {
        type: String,
        enum: ['cod', 'credit', 'debit', 'upi','razorpay','wallet'],
        required: true
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled','Refund Requested','refunded','Returned','Payment Failed']
    },
    previousStatus: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered']
    },
    reasonForRefund: {
        type: String,
    },
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true,
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true,
        },
        postalCode: {
            type: String,
            required: [true, 'Postal code is required'],
        }
    },
    couponApplied: {
        type: String, 
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
});

// Pre-save hook to generate orderId in "order/123456" format
orderSchema.pre('save', async function (next) {
    if (!this.orderId) { // If orderId is missing, generate it
        const lastOrder = await mongoose.model('Order').findOne().sort({ _id: -1 });

        let lastNumber = 100000; // Default starting number
        if (lastOrder && lastOrder.orderId) {
            const parts = lastOrder.orderId.split('/');
            if (parts.length === 2 && !isNaN(parts[1])) {
                lastNumber = parseInt(parts[1]);
            }
        }

        this.orderId = `order/${lastNumber + 1}`;
    }

    next();
});


module.exports = mongoose.model('Order', orderSchema);
