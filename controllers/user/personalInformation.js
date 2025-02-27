// controllers/profileController.js
const User = require('../../models/user');
const MainCategory = require('../../models/mainCategory');
const SubCategory = require('../../models/subCategory');


exports.getProfile = async (req, res) => {
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
        const user = await User.findOne({ _id: req.session.userId }).select('-password');
        console.log(user);
        console.log("hi",req.session.userId);
        res.render('../views/pages/user/personalInformation', { 
            user,
            categoriesWithSubs
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username } = req.body;
        const updatedUser  = await User.updateOne({ _id: req.session.userId }, { username: username });
        res.json({ success: true, user: updatedUser  });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

