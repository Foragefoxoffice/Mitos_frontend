'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function NewsListPage() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://mitoslearning.in/api/news`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if data exists and is an array
        if (!Array.isArray(data)) {
          throw new Error('Expected array but received: ' + JSON.stringify(data));
        }

        const normalized = data.map(news => ({
          ...news,
          _id: news.id || Math.random().toString(36).substring(2, 9), // Use id field from API
          createdAt: news.createdAt || new Date().toISOString()
        }));
  
        setNewsList(normalized);
        // Since your current API doesn't support pagination, we'll simulate it
        setTotalPages(Math.ceil(normalized.length / itemsPerPage));
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setNewsList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Client-side pagination since your API doesn't support it natively
  const paginatedNews = newsList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return 'Unknown date';
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          Error loading news: {error}
        </div>
        <button 
          onClick={() => {
            setError(null);
            setCurrentPage(1);
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">News Articles</h1>

      {paginatedNews.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No news articles found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedNews.map((news) => (
              <motion.div 
                key={news._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {news.image && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={news.image} 
                      alt={news.title || 'News image'}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl text-[#35095E] font-bold line-clamp-2 mb-2">
                    {news.title || 'Untitled News'}
                  </h2>
                  <p className="text-gray-500 text-sm mb-3">
                    Published on {formatDate(news.createdAt)}
                  </p>
                  <div 
                    className="prose prose-sm max-w-none mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{ 
                      __html: news.content 
                        ? news.content.substring(0, 100) + (news.content.length > 100 ? '...' : '')
                        : 'No content available' 
                    }}
                  />
                  <Link 
                    href={`/user/news/${news._id}`} 
                    className="inline-flex items-center text-[#35095E] hover:text-[#35095E] mt-2"
                  >
                    Read more <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md border ${
                      currentPage === page 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}