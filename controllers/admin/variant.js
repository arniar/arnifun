const Variant = require('../../models/variant');
const cloudinary = require('../../config/cloudinary');

// Helper functions
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const isCloudinaryUrl = (url) => {
  return isValidUrl(url) && url.includes('cloudinary.com');
};

const uploadToCloudinary = async (base64String) => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'variants',
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

const processImages = async (images) => {
  const processedImages = [];
  
  for (const image of images) {
    try {
      if (image.type === 'url' && isCloudinaryUrl(image.url)) {
        processedImages.push(image.url);
      } else if (image.type === 'base64') {
        const cloudinaryUrl = await uploadToCloudinary(image.url);
        processedImages.push(cloudinaryUrl);
      } else {
        console.warn('Invalid image format:', image.type);
        continue;
      }
    } catch (error) {
      console.error('Error processing image:', error);
      continue;
    }
  }

  return processedImages;
};

// GET route to variant
exports.getVariant = async (req, res, next) => {
  req.session.productId = req.query.id;
  res.render('../views/pages/admin/variant');
};

// GET route to fetch variants
exports.getVariants = async (req, res, next) => {
  try {
    const variant = await Variant.find({ productId: req.session.productId });
    res.json(variant);
  } catch (error) {
    console.error('Error fetching variants:', error);
    next(error); // Forward error to the next middleware
  }
};

// POST route to create new variant
exports.createVariant = async (req, res, next) => {
  try {
    const { color, images, sizes, tags } = req.body;
    const productId = req.session.productId;

    const processedImages = await processImages(images);

    const variant = new Variant({
      color,
      images: processedImages,
      sizes,
      tags,
      productId
    });

    const savedVariant = await variant.save();
    res.status(201).json(savedVariant);
  } catch (error) {
    console.error('Error creating variant:', error);
    next(error); // Forward error to the next middleware
  }
};

// PATCH route to update existing variant
exports.updateVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { color, images, sizes, tags } = req.body;

    const existingVariant = await Variant.findById(id);
    if (!existingVariant) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    const processedImages = await processImages(images);

    const updatedVariant = await Variant.findByIdAndUpdate(
      id,
      {
        color,
        images: processedImages,
        sizes,
        tags
      },
      { new: true }
    );

    res.json(updatedVariant);
  } catch (error) {
    console.error('Error updating variant:', error);
    next(error); // Forward error to the next middleware
  }
};

// DELETE route to remove variant
exports.deleteVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const variant = await Variant.findById(id);
    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    for (const imageUrl of variant.images) {
      if (isCloudinaryUrl(imageUrl)) {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`variants/${publicId}`);
      }
    }

    await Variant.findByIdAndDelete(id);
    res.json({ message: 'Variant deleted successfully' });
  } catch (error) {
    console.error('Error deleting variant:', error);
    next(error); // Forward error to the next middleware
  }
};