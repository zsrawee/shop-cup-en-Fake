import mongoose from 'mongoose';
import { isMock } from '@/lib/db';
import { createMockModel } from '@/lib/mockFactory';
import { mockProducts } from '@/lib/mockData';

interface IProductDocument extends mongoose.Document {
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  seller: mongoose.Types.ObjectId;
  ratings: Array<{
    userId: mongoose.Types.ObjectId;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  averageRating: number;
  numberOfReviews: number;
  createdAt: Date;
}

interface IProductModel extends mongoose.Model<IProductDocument> {
  calculateAverage(productId: string): Promise<void>;
}

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [String], // Array of image URLs
  category: String,
  stock: { type: Number, default: 0 },
  
  // Linking to the seller
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Ratings system
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      userName: String, 
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  
  // Stored fields for query speed
  averageRating: { type: Number, default: 0 },
  numberOfReviews: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

// Calculate average rating
ProductSchema.statics.calculateAverage = async function(productId: string) {
  const product = await this.findById(productId);

  if (product && product.ratings.length > 0) {
    const total = product.ratings.reduce((acc: number, item: { rating: number }) => item.rating + acc, 0);
    const averageRating = parseFloat((total / product.ratings.length).toFixed(1));
    const numberOfReviews = product.ratings.length;

    await this.findByIdAndUpdate(productId, {
      averageRating,
      numberOfReviews
    });
  } else {
    await this.findByIdAndUpdate(productId, {
      averageRating: 0,
      numberOfReviews: 0
    });
  }
};

ProductSchema.post('save', async function() {
  await (this.constructor as IProductModel).calculateAverage(this._id.toString());
});

const RealProduct = (mongoose.models.Product || mongoose.model('Product', ProductSchema)) as IProductModel;

export const Product = isMock ? (createMockModel(mockProducts, "Product") as unknown as IProductModel) : RealProduct;