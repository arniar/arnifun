const Product = require('../../models/product');
const User = require('../../models/user');
const mainCategory = require('../../models/mainCategory');
const subCategory = require('../../models/subCategory');
const MainCategory = require('../../models/mainCategory');
const SubCategory = require('../../models/subCategory');
const Variant = require('../../models/variant');
const mongoose = require('mongoose');

const getProductsByMainCategory = async (req, res, next) => {
  try {
    const sub = req.query.sub;
    console.log('Subcategory ID:', sub);

    if (!sub) {
      return res.status(400).json({ error: 'Subcategory ID is required' });
    }

    const subcategory = await subCategory.findById(sub);
    const subcategoryName = subcategory.subCategoryName

    if (!mongoose.Types.ObjectId.isValid(sub)) {
      return res.status(400).json({ error: 'Invalid subcategory ID format' });
    }

    const variants = await Variant.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $unwind: {
          path: "$productDetails",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          "productDetails.subCategory": new mongoose.Types.ObjectId(sub),
          "productDetails.status": "active"
        }
      },
      {
        $project: {
          _id: 1,
          productId: 1,
          color: 1,
          images: { $arrayElemAt: ["$images", 0] },
          sizes: 1,
          tags: 1,
          productDetails: {
            _id: 1,
            name: 1,
            price: 1,
            discountPrice: { 
              $ifNull: ["$productDetails.discountPrice", "$productDetails.price"] 
            },
            description: 1,
            subCategory: 1,
            status: 1
          }
        }
      },
      {
        $addFields: {
          "productDetails.discountPrice": {
            $ifNull: ["$productDetails.discountPrice", "$productDetails.price"]
          }
        }
      },
      {
        $sort: { "productDetails.price": 1 }
      }
    ]);

    console.log('Found variants:', variants.length);

    if (variants.length === 0) {
      console.log('No products found for subcategory:', sub);
    }

    // Transform the data to ensure all required fields are present
    const processedCards = variants.map(card => ({
      ...card,
      productDetails: {
        ...card.productDetails,
        discountPrice: card.productDetails.discountPrice || card.productDetails.price,
        price: card.productDetails.price || 0
      }
    }));

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

    const authentication = req.session.isAuthenticated;
    res.render('../views/pages/index/products', { 
      cards: processedCards,
      authentication,
      noProducts: processedCards.length === 0 ,
      title: subcategoryName,
      categoriesWithSubs
    });

  } catch (err) {
    console.error('Error in getProductsByMainCategory:', err);
    next(err);
  }
};

module.exports = {
  getProductsByMainCategory,
};