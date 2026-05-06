// Mock Model Factory to simulate Mongoose API
// This allows us to swap real models with mock ones without changing much code

function addMockMethods(item: any, modelName: string) {
  if (!item) return item;
  return {
    ...item,
    save: async function() {
      console.log(`[MOCK] ${modelName}.save() called`);
      
      // Persist User cart/wishlist to cookies in mock mode
      if (modelName === "User") {
        try {
          const { saveMockDataToCookies } = require('./mockPersistence');
          await saveMockDataToCookies(`user_${this._id}_cart`, this.cart);
          await saveMockDataToCookies(`user_${this._id}_wishlist`, this.wishlist);
          console.log(`[MOCK] User data persisted to cookies`);
        } catch (e) {
          console.error("[MOCK] Failed to persist user data", e);
        }
      }
      return this;
    }
  };
}

export function createMockModel<T>(data: T[], modelName: string) {
  return {
    find: function (query?: any) {
      let result = [...data];
      // Basic filtering (optional, can be expanded)
      if (query && query.seller) {
        result = result.filter((item: any) => item.seller === query.seller || (item.seller && item.seller._id === query.seller));
      }
      if (query && query.customer) {
        result = result.filter((item: any) => item.customer === query.customer || (item.customer && item.customer._id === query.customer));
      }
      if (query && query.title && query.title.$regex) {
        const regex = new RegExp(query.title.$regex, query.title.$options || "i");
        result = result.filter((item: any) => regex.test(item.title));
      }
      
      const chain = {
        sort: (sortQuery: any) => chain,
        lean: () => chain,
        skip: (skipCount: number) => {
          result = result.slice(skipCount);
          return chain;
        },
        limit: (limitCount: number) => {
          result = result.slice(0, limitCount);
          return chain;
        },
        populate: (path: any) => {
          const actualPath = typeof path === 'string' ? path : path.path;
          
          if (actualPath === "seller" && modelName === "Product") {
            result = result.map((item: any) => {
              const seller = require('./mockData').mockUsers.find((u: any) => u._id === item.seller);
              return { ...item, seller: seller || { name: "Unknown Seller", _id: item.seller } };
            });
          }
          
          if (actualPath === "items" && modelName === "Order") {
            result = result.map((item: any) => {
              const { mockProducts } = require('./mockData');
              const populatedItems = item.items.map((orderItem: any) => {
                const product = mockProducts.find((p: any) => p._id === orderItem.product);
                return { ...orderItem, product: product || { title: "Unknown Product", _id: orderItem.product } };
              });
              return { ...item, items: populatedItems };
            });
          }
          return chain;
        },
        select: (fields: string) => chain,
        exec: async () => result.map(item => addMockMethods(item, modelName)),
        then: function (resolve: any) {
          return Promise.resolve(result.map(item => addMockMethods(item, modelName))).then(resolve);
        },
      };
      return chain;
    },
    
    findOne: function (query: any) {
      let item = data.find((d: any) => {
        for (let key in query) {
          if (d[key] !== query[key]) return false;
        }
        return true;
      });

      // If no user found in mock mode, return a default mock user to allow testing
      if (!item && modelName === "User") {
        item = {
          _id: "mock_user_id",
          name: "Mock User",
          email: query.email || "mock@example.com",
          username: "mockuser",
          role: "admin", 
          avatar: "https://i.pravatar.cc/150?u=mock",
          createdAt: new Date(),
          cart: [],
          wishlist: [],
        } as any;
      }

      const chain = {
        lean: () => chain,
        populate: (path: string) => {
          if (modelName === "User" && item) {
            if (path === "cart.product") {
              const { mockProducts } = require('./mockData');
              item.cart = item.cart.map((cartItem: any) => {
                const product = mockProducts.find((p: any) => p._id === cartItem.product || p._id === cartItem.product?._id);
                return { ...cartItem, product: product || { _id: cartItem.product, title: "Unknown Product", price: 0 } };
              });
            }
          }
          return chain;
        },
        then: async function (resolve: any) {
          // Load persisted data for User
          if (item && modelName === "User") {
            try {
              const { getMockDataFromCookies } = require('./mockPersistence');
              const savedCart = await getMockDataFromCookies(`user_${item._id}_cart`, null);
              const savedWishlist = await getMockDataFromCookies(`user_${item._id}_wishlist`, null);
              if (savedCart) item.cart = savedCart;
              if (savedWishlist) item.wishlist = savedWishlist;
            } catch (e) {}
          }
          const result = addMockMethods(item, modelName);
          return resolve ? resolve(result) : result;
        },
      };
      return chain;
    },

    findById: function (id: string) {
      let item = data.find((d: any) => d._id === id);
      
      const chain = {
        populate: (path: string) => {
          if (path === "seller" && modelName === "Product" && item) {
            const seller = require('./mockData').mockUsers.find((u: any) => u._id === item.seller);
            item = { ...item, seller: seller || { name: "Unknown Seller", _id: item.seller } };
          }
          return chain;
        },
        lean: () => chain,
        then: async function (resolve: any) {
          // Load persisted data for User
          if (item && modelName === "User") {
            try {
              const { getMockDataFromCookies } = require('./mockPersistence');
              const savedCart = await getMockDataFromCookies(`user_${item._id}_cart`, null);
              const savedWishlist = await getMockDataFromCookies(`user_${item._id}_wishlist`, null);
              if (savedCart) item.cart = savedCart;
              if (savedWishlist) item.wishlist = savedWishlist;
            } catch (e) {}
          }
          const result = addMockMethods(item, modelName);
          return resolve ? resolve(result) : result;
        },
      };
      return chain;
    },

    findByIdAndDelete: async function (id: string) {
      console.log(`[MOCK] Deleted ${modelName} with ID: ${id}`);
      return { success: true };
    },

    findByIdAndUpdate: async function (id: string, update: any) {
      console.log(`[MOCK] Updated ${modelName} with ID: ${id}`, update);
      return { success: true };
    },

    create: async function (doc: any) {
      console.log(`[MOCK] Created new ${modelName}:`, doc);
      const newItem = { _id: "new_id_" + Math.random(), ...doc, createdAt: new Date() };
      return addMockMethods(newItem, modelName);
    },

    updateMany: async function (query: any, update: any) {
      console.log(`[MOCK] updateMany on ${modelName}:`, query, update);
      return { acknowledged: true, modifiedCount: 1 };
    },

    countDocuments: async function (query?: any) {
      if (!query || Object.keys(query).length === 0) return data.length;
      
      let filtered = [...data];
      if (query.seller) {
        filtered = filtered.filter((item: any) => item.seller === query.seller || (item.seller && item.seller._id === query.seller));
      }
      if (query.customer) {
        filtered = filtered.filter((item: any) => item.customer === query.customer || (item.customer && item.customer._id === query.customer));
      }
      if (query.title && query.title.$regex) {
        const regex = new RegExp(query.title.$regex, query.title.$options || "i");
        filtered = filtered.filter((item: any) => regex.test(item.title));
      }
      return filtered.length;
    }
  };
}
