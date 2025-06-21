
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious, 
} from '@/components/ui/pagination';
import { useState } from 'react';

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 2;

  const blogPosts = [
    {
      id: 1,
      title: 'Mastering Poker Fundamentals',
      description: 'Learn the essential skills every poker player needs to succeed at the tables.',
      date: 'March 15, 2024',
      readTime: '5 min read',
      category: 'Strategy',
    },
    {
      id: 2,
      title: 'Bankroll Management 101',
      description: 'How to properly manage your poker bankroll to avoid going broke.',
      date: 'March 10, 2024',
      readTime: '7 min read',
      category: 'Finance',
    },
    {
      id: 3,
      title: 'Reading Your Opponents',
      description: 'Advanced techniques for reading tells and understanding player behavior.',
      date: 'March 5, 2024',
      readTime: '6 min read',
      category: 'Psychology',
    },
    {
      id: 4,
      title: "Position Play in Texas Hold'em",
      description: 'Understanding how position affects your strategy and decision-making.',
      date: 'March 1, 2024',
      readTime: '4 min read',
      category: 'Strategy',
    },
    {
      id: 5,
      title: 'Tournament vs Cash Game Strategy',
      description: 'Key differences between tournament and cash game approaches.',
      date: 'February 25, 2024',
      readTime: '8 min read',
      category: 'Strategy',
    },
  ];

  const totalPages = Math.ceil(blogPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = blogPosts.slice(startIndex, startIndex + postsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-slate-200 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent mb-4">
            PokerConnect Blog
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Insights, strategies, and stories from the world of poker to help you elevate your game.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-6 md:gap-8 mb-8">
          {currentPosts.map((post) => (
            <Card key={post.id} className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl hover:bg-slate-800/60 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <CardTitle className="text-xl text-slate-200 hover:text-emerald-400 transition-colors cursor-pointer">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {post.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link 
                  to={`/blog/${post.id}`}
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium inline-flex items-center transition-colors"
                >
                  Read more
                  <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mb-12">
            <Pagination>
              <PaginationContent className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-xl rounded-lg p-2">
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
handlePageChange(currentPage - 1);
}
                    }}
                    className={`text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 ${
                      currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={currentPage === page}
                      className={`${
                        currentPage === page
                          ? 'bg-emerald-500 text-slate-900 hover:bg-emerald-600'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                      }`}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) {
handlePageChange(currentPage + 1);
}
                    }}
                    className={`text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 ${
                      currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="text-center">
          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-200">Stay Updated</CardTitle>
              <CardDescription className="text-slate-400">
                Get the latest poker strategies and insights delivered to your inbox.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
                <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900 font-medium rounded-md hover:from-emerald-600 hover:to-violet-600 transition-colors">
                  Subscribe
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Blog;
