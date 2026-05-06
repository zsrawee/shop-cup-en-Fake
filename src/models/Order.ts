import mongoose from 'mongoose';
import { isMock } from '@/lib/db';
import { createMockModel } from '@/lib/mockFactory';
import { mockOrders } from '@/lib/mockData';

const OrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number // Price at time of purchase
    }
  ],
  totalAmount: Number,
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  shippingAddress: String,
  paymentStatus: { type: String, default: 'unpaid' },
  createdAt: { type: Date, default: Date.now }
});

const RealOrder = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export const Order = isMock ? (createMockModel(mockOrders, "Order") as any) : RealOrder;