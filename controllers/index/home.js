const Banner = require('../../models/banner');
const MainCategory = require('../../models/mainCategory');
const SubCategory = require('../../models/subCategory');
const Product = require('../../models/product');
const Variant = require('../../models/variant');

const homeController = {
    getHomePage: async (req, res) => {
        try {
            // Fetch active banners
            const banners = await Banner.find({ isActive: true })
                .sort({ order: 1 })

                console.log(banners)

            // Fetch top 3 main categories
            const topCategories = await MainCategory.find({ status: 'active' })
                .limit(3);

            // Fetch top sold items with variant images and IDs
            const topSoldItems = await Product.aggregate([
                {
                    $match: {
                        status: 'active',
                    }
                },
                {
                    $lookup: {
                        from: 'orders',
                        localField: 'productId',
                        foreignField: 'productId',
                        as: 'orders'
                    }
                },
                {
                    $lookup: {
                        from: 'variants',
                        localField: '_id',
                        foreignField: 'productId',
                        as: 'variants'
                    }
                },
                {
                    $addFields: {
                        orderCount: { $size: '$orders' },
                        // Use product image if exists, otherwise use first image from first variant
                        displayImage: {
                            $cond: {
                                if: { $ne: ['$image', '/default-image.png'] },
                                then: '$image',
                                else: {
                                    $let: {
                                        vars: {
                                            firstVariant: { $arrayElemAt: ['$variants', 0] }
                                        },
                                        in: {
                                            $ifNull: [
                                                { $arrayElemAt: ['$$firstVariant.images', 0] },
                                                '/default-image.png'
                                            ]
                                        }
                                    }
                                }
                            }
                        },
                        // Add first variant ID
                        variantId: {
                            $ifNull: [
                                { $arrayElemAt: ['$variants._id', 0] },
                                null
                            ]
                        }
                    }
                },
                {
                    $sort: { orderCount: -1 }
                },
                {
                    $limit: 4
                },
                {
                    $project: {
                        _id: 1,
                        productId: 1,
                        name: 1,
                        price: 1,
                        discountPrice: 1,
                        displayImage: 1,
                        orderCount: 1,
                        variantId: 1
                    }
                }
            ]);

            // Fetch featured products with variant images and IDs
            const featuredProducts = await Product.aggregate([
                {
                    $match: {
                        status: 'active',
                        discountPrice: { $exists: true, $ne: null }
                    }
                },
                {
                    $lookup: {
                        from: 'variants',
                        localField: '_id',
                        foreignField: 'productId',
                        as: 'variants'
                    }
                },
                {
                    $addFields: {
                        discountPercentage: {
                            $multiply: [
                                {
                                    $divide: [
                                        { $subtract: ['$price', '$discountPrice'] },
                                        '$price'
                                    ]
                                },
                                100
                            ]
                        },
                        // Use product image if exists, otherwise use first image from first variant
                        displayImage: {
                            $cond: {
                                if: { $ne: ['$image', '/default-image.png'] },
                                then: '$image',
                                else: {
                                    $let: {
                                        vars: {
                                            firstVariant: { $arrayElemAt: ['$variants', 0] }
                                        },
                                        in: {
                                            $ifNull: [
                                                { $arrayElemAt: ['$$firstVariant.images', 0] },
                                                '/default-image.png'
                                            ]
                                        }
                                    }
                                }
                            }
                        },
                        // Add first variant ID
                        variantId: {
                            $ifNull: [
                                { $arrayElemAt: ['$variants._id', 0] },
                                null
                            ]
                        }
                    }
                },
                {
                    $sort: { discountPercentage: -1 }
                },
                {
                    $limit: 4
                },
                {
                    $project: {
                        _id: 1,
                        productId: 1,
                        name: 1,
                        price: 1,
                        discountPrice: 1,
                        discountPercentage: 1,
                        displayImage: 1,
                        variantId: 1
                    }
                }
            ]);

            // Get all categories with subcategories for hover menu
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

            res.render('../views/pages/index/home.ejs', {
                banners,
                topCategories,
                topSoldItems,
                featuredProducts,
                categoriesWithSubs,
                authentication: req.session.isAuthenticated || false
            });
        } catch (error) {
            console.error('Home page error:', error);
            res.status(500).render('error', { 
                message: 'Error loading home page' 
            });
        }
    }
};

module.exports = homeController;