const Product = require('../../models/product');
const Variant = require('../../models/variant');
const mongoose = require('mongoose');
const MainCategory = require('../../models/mainCategory');
const SubCategory = require('../../models/subCategory');

// GET home page
exports.getHomePage = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        req.session.search = search;
        const authentication = req.session.isAuthenticated;
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
        res.render('../views/pages/index/search', { search, authentication,categoriesWithSubs});
    } catch (err) {
        console.error("Error rendering home page:", err);
        res.status(500).send("Error loading the home page.");
    }
};

// GET search recommendations
exports.getSearchRecommendations = async (req, res, next) => {
    try {
        const filter = req.query.q || "";
        const categories = req.query.categories ? req.query.categories.split(',') : [];
        
        // Base query for tags
        let tagsQuery = {};
        
        // Add category filter if categories are specified
        if (categories.length > 0) {
            const categoryIds = categories.map(cat => new mongoose.Types.ObjectId(cat));
            tagsQuery = {
                "productDetails.subCategory.mainCategory": { $in: categoryIds }
            };
        }

        // Get distinct tags with optional category filter
        let tags = await Variant.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $match: tagsQuery
            },
            {
                $unwind: "$tags"
            },
            {
                $group: {
                    _id: "$tags"
                }
            }
        ]);

        // Extract tag values and filter based on search query
        tags = tags.map(t => t._id).filter(tag => 
            filter ? tag.toLowerCase().includes(filter.toLowerCase()) : true
        );

        // Sort tags and limit to top 10 matches
        tags.sort((a, b) => {
            const aStartsWith = a.toLowerCase().startsWith(filter.toLowerCase());
            const bStartsWith = b.toLowerCase().startsWith(filter.toLowerCase());
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            return a.localeCompare(b);
        });

        console.log(tags)

        res.json(tags.slice(0, 10));
    } catch (err) {
        console.error("Error fetching recommendations:", err);
        res.status(500).json({ error: "Error fetching recommendations.", details: err.message });
    }
};

// GET products
exports.getProducts = async (req, res, next) => {
  try {
      const {
          sort = 'popularity',
          categories = [],
          minPrice,
          maxPrice,
          sizes = [],
          search = req.session.search || ''
      } = req.query;

      console.log("Sort parameter:", sort); // Debug log
      
      const categoriesArray = Array.isArray(categories) ? categories : [categories].filter(Boolean);

      let aggregationPipeline = [
          {
              $lookup: {
                  from: "products",
                  localField: "productId",
                  foreignField: "_id",
                  as: "productDetails"
              }
          },
          { $unwind: "$productDetails" },
          {
              $lookup: {
                  from: "subcategories",
                  localField: "productDetails.subCategory",
                  foreignField: "_id",
                  as: "subcategoryDetails"
              }
          },
          { $unwind: "$subcategoryDetails" },
          {
              $match: {
                  "productDetails.status": "active"
              }
          }
      ];

      console.log("king",search)

      // Search handling - but without affecting sort order
      if (search) {
          aggregationPipeline.push({
              $match: {
                  $or: [
                      { tags: { $regex: new RegExp(search, 'i') } },
                      { "productDetails.name": { $regex: new RegExp(search, 'i') } }
                  ]
              }
          });
      }

      // Add remaining filters
      if (categoriesArray.length > 0) {
          const categoryIds = categoriesArray.map(cat => new mongoose.Types.ObjectId(cat));
          aggregationPipeline.push({
              $match: {
                  "subcategoryDetails.mainCategory": { $in: categoryIds }
              }
          });
      }

      if (minPrice || maxPrice) {
          const priceMatch = {};
          if (minPrice) priceMatch.$gte = parseFloat(minPrice);
          if (maxPrice) priceMatch.$lte = parseFloat(maxPrice);
          
          aggregationPipeline.push({
              $match: {
                  "productDetails.discountPrice": priceMatch
              }
          });
      }

      if (sizes.length > 0) {
          const sizeConditions = sizes.map(size => ({
              [`sizes.${size}`]: { $gt: 0 }
          }));
          
          aggregationPipeline.push({
              $match: {
                  $or: sizeConditions
              }
          });
      }

      // Add calculated fields for sorting
      aggregationPipeline.push({
          $addFields: {
              totalStock: {
                  $reduce: {
                      input: { $objectToArray: "$sizes" },
                      initialValue: 0,
                      in: { $add: ["$$value", "$$this.v"] }
                  }
              },
              popularityScore: {
                  $multiply: [
                      { $ifNull: ["$productDetails.review", 0] },
                      {
                          $reduce: {
                              input: { $objectToArray: "$sizes" },
                              initialValue: 0,
                              in: { $add: ["$$value", "$$this.v"] }
                          }
                      }
                  ]
              }
          }
      });

      // Apply sort - simplified and direct
      let sortStage = {};
      switch (sort) {
          case 'price-low-high':
              sortStage = { "productDetails.discountPrice": 1 };
              break;
          case 'price-high-low':
              sortStage = { "productDetails.discountPrice": -1 };
              break;
          case 'rating':
              sortStage = { "productDetails.review": -1 };
              break;
          case 'az':
              sortStage = { "productDetails.name": 1 };
              break;
          case 'za':
              sortStage = { "productDetails.name": -1 };
              break;
          case 'popularity':
          default:
              sortStage = { popularityScore: -1 };
      }

      // Add sort stage
      aggregationPipeline.push({ $sort: sortStage });

      // Final projection
      aggregationPipeline.push({
          $project: {
              _id: 1,
              productId: 1,
              color: 1,
              images: { $arrayElemAt: ["$images", 0] },
              sizes: 1,
              tags: 1,
              productDetails: 1,
              totalStock: 1,
              mainCategory: "$subcategoryDetails.mainCategory",
              subCategory: "$subcategoryDetails._id"
          }
      });

      const products = await Variant.aggregate(aggregationPipeline);
      console.log("Sort applied:", sortStage); // Debug log
      res.json(products);

  } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Error fetching products.", details: err.message });
  }
};