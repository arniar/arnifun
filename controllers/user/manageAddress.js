// controllers/addressController.js
const Address = require('../../models/address');
const MainCategory = require('../../models/mainCategory');
const SubCategory = require('../../models/subCategory');



exports.getAllAddresses = async (req, res) => {
    try {
        const categoriesWithSubs = await MainCategory.aggregate([
            {
                $match: { status: 'active' }
            },
            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_id',
                    foreignField: 'mainCategory',
                    pipeline: [{ $match: { status: 'active' } }],
                    as: 'subcategories'
                }
            }
        ]);
        const addresses = await Address.find({ userId: req.session.userId });
        res.render('../views/pages/user/manageAddress', { addresses,categoriesWithSubs });
    } catch (error) {
        res.status(500).send('Server error');
    }
};

exports.createAddress = async (req, res) => {
    try {
        const address = new Address({ ...req.body, userId: req.session.userId });
        await address.save();
        res.status(201).json({ success: true, address });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, address });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        await Address.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.setPrimaryAddress = async (req, res) => {
    try {
        await Address.updateMany({ userId: req.session.userId }, { isPrimary: false });
        const address = await Address.findByIdAndUpdate(req.params.id, { isPrimary: true }, { new: true });
        res.status(200).json({ success: true, address });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};