// Mock Data for the application
// This data is used when MONGODB_URI is not defined

export const mockUsers = [
  {
    _id: "user1",
    name: "John Doe",
    email: "john@example.com",
    username: "johndoe",
    role: "admin",
    avatar: "https://i.pravatar.cc/150?u=user1",
    createdAt: new Date(),
  },
  {
    _id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    username: "janesmith",
    role: "seller",
    avatar: "https://i.pravatar.cc/150?u=user2",
    sellerInfo: {
      storeName: "Jane's Boutique",
      description: "Handmade crafts and vintage items.",
      isVerified: true,
      rating: 4.8,
    },
    createdAt: new Date(),
  },
];

export const mockProducts = [
  {
    _id: "prod1",
    title: "Premium Coffee Mug",
    description: "A high-quality ceramic mug for your daily caffeine fix. Dishwasher and microwave safe.",
    price: 19.99,
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=500"],
    category: "Home & Kitchen",
    stock: 50,
    seller: "user2",
    averageRating: 4.5,
    numberOfReviews: 12,
    createdAt: new Date(),
  },
  {
    _id: "prod2",
    title: "Wireless Noise Cancelling Headphones",
    description: "Experience pure sound with our latest noise-cancelling technology. 30-hour battery life.",
    price: 299.99,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500"],
    category: "Electronics",
    stock: 15,
    seller: "user2",
    averageRating: 4.8,
    numberOfReviews: 45,
    createdAt: new Date(),
  },
  {
    _id: "prod3",
    title: "Eco-Friendly Yoga Mat",
    description: "Non-slip yoga mat made from natural rubber. Perfect for all types of yoga and pilates.",
    price: 45.00,
    images: ["https://images.unsplash.com/photo-1592432676556-26d56d0b463b?q=80&w=500"],
    category: "Fitness",
    stock: 100,
    seller: "user2",
    averageRating: 4.2,
    numberOfReviews: 8,
    createdAt: new Date(),
  },
  {
    _id: "prod4",
    title: "Stainless Steel Water Bottle",
    description: "Double-walled vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours.",
    price: 25.00,
    images: ["https://images.unsplash.com/photo-1602143307185-8a155055819e?q=80&w=500"],
    category: "Outdoor",
    stock: 75,
    seller: "user2",
    averageRating: 4.7,
    numberOfReviews: 20,
    createdAt: new Date(),
  },
];

export const mockOrders = [
  {
    _id: "order1",
    customer: "user1",
    items: [
      {
        product: "prod1",
        quantity: 2,
        price: 19.99,
      }
    ],
    shippingAddress: "123 Main St, New York, USA",
    totalAmount: 39.98,
    status: "shipped",
    paymentStatus: "paid",
    createdAt: new Date(),
  }
];
