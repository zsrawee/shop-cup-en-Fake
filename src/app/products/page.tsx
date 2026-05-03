import { connectToDB } from "@/lib/db";
import { Product } from "@/models/Product";
import Link from "next/link";
import { ProductCard } from "@/components/ProductList"; // Use the card we created

// Function to create pagination buttons
function PaginationButtons({ currentPage, totalPages, searchQuery }: { currentPage: number, totalPages: number, searchQuery: string }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-10">
      {currentPage > 1 && (
        <Link 
          href={`/products?page=${currentPage - 1}&search=${searchQuery}`}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
        >
          Previous
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={`/products?page=${page}&search=${searchQuery}`}
          className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition ${
            page === currentPage 
              ? "bg-blue-600 text-white shadow-md" 
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link 
          href={`/products?page=${currentPage + 1}&search=${searchQuery}`}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
        >
          Next
        </Link>
      )}
    </div>
  );
}

export default async function ProductsPage({
  searchParams, 
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // 1. Read page number and search query from URL
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const search = params?.search || "";
  const limit = 20; // Number of products per page

  await connectToDB();

  // 2. Build search query
  // If there is a search query, search in product title (case-insensitive)
  const query: any = {};
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  // 3. Fetch total number of products (to calculate total pages)
  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalProducts / limit);

  // 4. Fetch products for the current page
  const products = await Product.find(query)
    .sort({ createdAt: -1 }) // Newest first
    .skip((page - 1) * limit) // Skip previous products
    .limit(limit) // Take only 20 products
    .lean();

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen" dir="rtl">
      
      {/* === Page Header and Search Bar === */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">All Products 🛍️</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalProducts} products {search && `Search results for "${search}"`}
          </p>
        </div>

        {/* Search Bar */}
        {/* Using a simple form, pressing Enter will update the URL and send the search query */}
        <form action="/products" method="GET" className="w-full md:w-96 flex gap-2">
          <input
            type="text"
            name="search" // ⚠️ Name must be search to match searchParams
            defaultValue={search} // To keep the search query in the field
            placeholder="Search for a product..."
            className="flex-1 border border-gray-300 p-3 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Search 🔍
          </button>
        </form>
      </div>

      {/* === Product Grid === */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-5xl mb-4">🤷‍♂️</p>
          <p className="text-gray-500 text-lg">No products match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            // Use ProductCard which we linked to the Dynamic Route previously
            <ProductCard key={product._id.toString()} product={product} />
          ))}
        </div>
      )}

      {/* === Pagination === */}
      {totalPages > 1 && (
        <PaginationButtons 
          currentPage={page} 
          totalPages={totalPages} 
          searchQuery={search} 
        />
      )}
    </div>
  );
}