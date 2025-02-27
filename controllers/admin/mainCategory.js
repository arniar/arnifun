const mongoose = require('mongoose');
const cloudinary = require('../../config/cloudinary');
const Product = require('../../models/product');
const mainCategory = require('../../models/mainCategory');
const subCategories = require('../../models/subCategory');

const ObjectId = mongoose.Types.ObjectId;

exports.getAdminCategory = async (req, res, next) => {
    try {
        res.render('../views/pages/admin/mainCategory');
    } catch (error) {
        console.error('Error rendering admin category:', error);
        next(error); // Forward error to the next middleware
    }
};

exports.postAdminCategoryTable = async (req, res, next) => {
    try {
        let mainCategories = await mainCategory.find();
        let subcategoriesCount = await subCategories.aggregate([{ $group: { _id: "$mainCategory", count: { $sum: 1 } } }]).exec();
        res.render('../views/partials/admin/mainCategoryTable', { mainCategories, subcategoriesCount });
    } catch (error) {
        console.error('Error fetching admin category table:', error);
        next(error); // Forward error to the next middleware
    }
};

exports.patchMainCategoryOffer = async (req, res, next) => {
    try {
        let offer = req.body.offer;
        let Id = req.body.Id;

        await mainCategory.updateOne({ _id: Id }, { $set: { offerPercentage: offer } });
        let subcategory = await subCategories.find({ mainCategory: Id });
        await subCategories.updateMany({ mainCategory: Id }, { $set: { offerPercentage: 0 } });

        for (const category of subcategory) {
            let products = await Product.find({ subCategory: category._id });
            for (const product of products) {
                await Product.updateOne(
                    { _id: product._id },
                    {
                        $set: {
                            discountPrice: parseFloat((product.price - (product.price * offer / 100)).toFixed(0))
                        }
                    }
                );
            }
        }
        res.send("ok");
    } catch (error) {
        console.error('Error updating main category offer:', error);
        next(error); // Forward error to the next middleware
    }
};

exports.getAdminCategorySearch = async (req, res, next) => {
    try {
        let mainCategories = await mainCategory.find({ mainCategoryName: { $regex: `${req.query.value}`, $options: 'i' } });
        let subcategoriesCount = await subCategories.aggregate([{ $group: { _id: "$mainCategory", count: { $sum: 1 } } }]).exec();
        res.render('adminCategory/table', { mainCategories, subcategoriesCount });
    } catch (error) {
        console.error('Error searching admin categories:', error);
        next(error); // Forward error to the next middleware
    }
};

exports.postAdminCategoryCreate = async (req, res, next) => {
    try {
        const exist = await mainCategory.findOne({ mainCategoryName: req.body.name });
        if (exist) {
            return res.send("exists");
        }

        const { croppedImage } = req.body;
        let name = req.body.name.toLowerCase();

        if (!croppedImage) {
            return res.status(400).json({ error: 'No image provided in the request body' });
        }

        const result = await cloudinary.uploader.upload(croppedImage, {
            folder: 'adminCategory'
        });
        await mainCategory.create({ mainCategoryName: name, image: result.secure_url });
        return res.send('done');
    } catch (error) {
        console.error('Error creating admin category:', error);
        next(error); // Forward error to the next middleware
    }
};

exports.postAdminCategoryEdit = async (req, res, next) => {
    try {
        let { croppedImage, name, id } = req.body;
        name = name.toLowerCase();
        console.log(req.body)

        const exist = await mainCategory.findOne({ mainCategoryName: name });
        if (exist) {
            return res.send("exists");
        }

        if (!id || !name) {
            return res.status(400).json({ error: 'ID and Name are required fields.' });
        }

        if (!croppedImage) {
            await mainCategory.updateOne({ _id: id }, { mainCategoryName: name });
            return res.send("done");
        }

        const result = await cloudinary.uploader.upload(croppedImage, {
            folder: 'adminCategory'
        });

        await mainCategory.updateOne(
            { _id: id },
            { mainCategoryName: name, image: result.secure_url }
        );

        res.send('done');
    } catch (error) {
        console.error('Error editing admin category:', error);
        next(error); // Forward error to the next middleware
    }
};

exports.patchInactivate = async (req, res, next) => {
    try {
        const id = req.body.id;
        await mainCategory.updateOne({ _id: id }, { status: "inactive" });
        await subCategories.updateMany({ mainCategory: id }, { status: "inactive" });
        let subcategory = await subCategories.find({ mainCategory: id });
        for (const category of subcategory) {
            await Product.updateMany({ subCategory: category._id }, { $set: { "status": "inactive" } });
        }
        res.send("ok");
    } catch (error) {
        console.error('Error inactivating category:', error);
        next(error); // Forward error to the next middleware
    }
};

exports.patchActivate = async (req, res, next) => {
    try {
        const id = req.body.id;
        await mainCategory.updateOne({ _id: id }, { status: "active" });
        await subCategories.updateMany({ mainCategory: id }, { status: "active" });
        let subcategory = await subCategories.find({ mainCategory: id });
        for (const category of subcategory) {
            await Product.updateMany({ subCategory: category._id }, { $set: { "status": "active" } });
        }
        res.send("ok");
    } catch (error) {
        console.error('Error activating category:', error);
        next(error); // Forward error to the next middleware
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const id = req.body.id;
        await mainCategory.deleteOne({ _id: id });
        await subCategories.deleteMany({ mainCategory: id });
        let subcategory = await subCategories.find({ mainCategory: id });
        for (const category of subcategory) {
            await Product.deleteMany({ subCategory: category._id });
        }
        res.send("ok");
    } catch (error) {
        console.error('Error deleting category:', error);
        next(error); // Forward error to the next middleware
    }
};