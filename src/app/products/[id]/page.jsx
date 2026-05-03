import { connectToDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductActions from "@/components/ProductActions";
 // Cart and Wishlist buttons

export default async function ProductDetails({ params }) {
  // In modern Next.js versions, await must be used with params
  const { id } = await params;

  await connectToDB();

  // Fetch product based on ID, and use populate to get seller data
  const product = await Product.findById(id).populate("seller").lean();

  // If product is not found, show 404 page
  if (!product) {
    console.error(`Product with ID  not found.`);
    notFound();
  }

  // Convert seller object to appropriate type for use
  const seller = product.seller;

  return (
    <div className="min-h-screen bg-gray-50 py-10" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Back to store button */}
        <Link href="/products" className="text-blue-600 hover:underline mb-6 inline-block font-semibold">
          ← Back to all products
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            
            {/* === Right Section: Product Images === */}
            <div className="p-6 bg-gray-50 flex flex-col items-center justify-center">
              <div className="w-full max-w-md aspect-square bg-white rounded-2xl overflow-hidden border shadow-sm mb-4">
                {/* Main Image (here we show the first image as the primary image) */}
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">📸</div>
                )}
              </div>
              
              {/* Thumbnail preview (if there are multiple images) */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {product.images.map((img, idx) => (
                    <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border-2 border-blue-500 cursor-pointer">
                      <img src={img} alt={`product-${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* === Left Section: Product Details === */}
            <div className="p-8 flex flex-col">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{product.title}</h1>
              
              {/* Product Rating */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-500 text-lg">⭐</span>
                <span className="font-bold text-gray-800">{product.averageRating || 0}</span>
                <span className="text-gray-400 text-sm">({product.numberOfReviews} ratings)</span>
              </div>

              {/* Product Price */}
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-blue-600">${product.price}</span>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                    In stock ({product.stock} items)
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                    Out of stock ❌
                  </span>
                )}
              </div>

              {/* Product Description */}
              <div className="mb-8 flex-1">
                <h3 className="font-bold text-gray-800 mb-2">Product Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>

              {/* Action buttons (Cart and Wishlist) - uses the component we created previously */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <ProductActions productId={product._id.toString()} />
                </div>
              )}

              {/* Seller Info */}
              {seller && (
                <div className="border-t pt-6 mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                      {seller.avatar ? (
                        <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
                      ) : (
                        seller.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sold by</p>
                      <Link href={`/profile/${seller.username}`} className="font-bold text-gray-900 hover:text-blue-600 transition">
                        {seller.sellerInfo?.storeName || seller.name}
                      </Link>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* === Ratings Section (dedicated space for adding ratings later) === */}
        <div className="mt-10 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          {product.ratings && product.ratings.length > 0 ? (
            <div className="space-y-4">
              {product.ratings.map((review, idx) => (
                <div key={idx} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">{review.userName}</span>
                    <span className="text-yellow-500 text-sm">⭐ {review.rating}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to rate this product!</p>
          )}
        </div>

      </div>
    </div>
  );
}