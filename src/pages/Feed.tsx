
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, House, Bell, Bookmark, ThumbsUp, 
  MessageCircle, Share, Image, Table, ChartLine,
  Rss, Fire, TrendingUp, Users
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const Feed = () => {
  const [postContent, setPostContent] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-700/20 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-lg flex items-center justify-center">
                <span className="text-gray-800 text-lg">♦</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                PokerConnect
              </span>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  type="text"
                  className="w-full h-[40px] pl-10 pr-4 bg-zinc-800/40 rounded-xl border border-zinc-700/30 text-sm text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Search hands, players, tags..."
                />
              </div>
            </div>
            
            {/* Navigation Icons */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-zinc-400 hover:text-zinc-200 relative">
                <House className="w-5 h-5" />
              </button>
              <button className="p-2 text-zinc-400 hover:text-zinc-200">
                <Share className="w-5 h-5" />
              </button>
              <button className="p-2 text-zinc-400 hover:text-zinc-200 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>
              <div className="relative">
                <Avatar className="w-8 h-8 border border-zinc-700/50">
                  <AvatarImage src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952" alt="Profile" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-64 fixed h-[calc(100vh-4rem)] overflow-y-auto border-r border-zinc-700/20 pt-6">
          <nav className="px-4 space-y-1">
            <div className="flex items-center px-4 py-2.5 text-zinc-200 rounded-xl bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30 cursor-pointer">
              <Rss className="w-5 h-5 text-emerald-500 mr-3" />
              <span>Feed</span>
            </div>
            <div className="flex items-center px-4 py-2.5 text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800/40 cursor-pointer">
              <Fire className="w-5 h-5 mr-3" />
              <span>Trending Hands</span>
            </div>
            <div className="flex items-center px-4 py-2.5 text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800/40 cursor-pointer">
              <ChartLine className="w-5 h-5 mr-3" />
              <span>My Stats</span>
            </div>
            <div className="flex items-center px-4 py-2.5 text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800/40 cursor-pointer">
              <Users className="w-5 h-5 mr-3" />
              <span>Following</span>
            </div>
            <div className="flex items-center px-4 py-2.5 text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800/40 cursor-pointer">
              <span className="w-5 h-5 mr-3 text-center">?</span>
              <span>Help & Support</span>
            </div>
          </nav>
          
          <div className="mt-8 px-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-4 mb-2">My Stats Overview</h3>
            <div className="bg-zinc-900/60 rounded-xl border border-zinc-700/20 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Hands Played</span>
                <span className="text-emerald-500 font-medium">1,280</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Win Rate</span>
                <span className="text-emerald-500 font-medium">+5.2 BB/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Top Hand</span>
                <span className="text-zinc-200 font-medium">A♠A♥</span>
              </div>
              <Button className="w-full mt-2 py-2 bg-zinc-800/40 rounded-xl border border-zinc-700/30 text-zinc-200 text-sm hover:bg-zinc-800/60">
                View Full Stats
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 lg:mr-64 px-4 py-6">
          {/* Post Composer */}
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-700/20 p-4 mb-6">
            <div className="flex space-x-3">
              <Avatar className="w-10 h-10 border border-zinc-700/50">
                <AvatarImage src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952" alt="Your avatar" />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="bg-zinc-800/40 rounded-xl border border-zinc-700/30 p-3 text-zinc-200 placeholder-zinc-400 cursor-pointer hover:border-zinc-600/50 transition-colors resize-none min-h-[50px]"
                  placeholder="Share a hand or ask for advice..."
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-zinc-800/40">
                      <Image className="w-4 h-4" />
                      <span className="text-sm">Image</span>
                    </button>
                    <button className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-zinc-800/40">
                      <Table className="w-4 h-4" />
                      <span className="text-sm">Hand History</span>
                    </button>
                    <button className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-zinc-800/40">
                      <ChartLine className="w-4 h-4" />
                      <span className="text-sm">Stats</span>
                    </button>
                  </div>
                  <Button className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-xl text-gray-800 text-sm font-medium">
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feed */}
          <div className="space-y-6">
            {/* Post 1 */}
            <div className="bg-zinc-900/60 rounded-xl border border-zinc-700/20 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="w-10 h-10 border border-zinc-700/50">
                    <AvatarImage src="https://images.unsplash.com/photo-1582562124811-c09040d0a901" alt="User avatar" />
                    <AvatarFallback>AR</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-zinc-200">Alex Rivera</h3>
                      <span className="ml-2 text-xs text-zinc-400">@pokerwizard</span>
                    </div>
                    <p className="text-xs text-zinc-400">2 hours ago</p>
                  </div>
                </div>
                <h2 className="text-lg font-medium mb-2 text-zinc-200">Hero Calls River Bet with Ace High</h2>
                <p className="text-zinc-300 mb-4">
                  Just played this hand at $2/$5. Villain was super aggressive all night. On the river with A♥9♦ on a K♠7♦3♣2♥4♠ board, I called a 3/4 pot bet. Was this a good call or am I spewing?
                </p>
                <div className="bg-zinc-800/40 rounded-xl p-3 mb-4 border border-zinc-700/30">
                  <div className="flex justify-between text-sm text-zinc-400 mb-2">
                    <span>$2/$5 NLH - 6 players</span>
                    <span>Pot: $380</span>
                  </div>
                  <div className="flex space-x-2 mb-2">
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">Cash Game</span>
                    <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">Hero Call</span>
                    <span className="bg-violet-500/20 text-violet-400 text-xs px-2 py-0.5 rounded-full">River Decision</span>
                  </div>
                  <div className="flex items-center space-x-3 mt-3">
                    <div className="flex-1 h-1.5 bg-zinc-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <span className="text-zinc-300 text-sm">68% Good Call</span>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-800/30 px-4 py-3 flex items-center justify-between border-t border-zinc-700/20">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-emerald-500">
                    <ThumbsUp className="w-4 h-4" />
                    <span>83</span>
                  </button>
                  <button className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200">
                    <MessageCircle className="w-4 h-4" />
                    <span>14</span>
                  </button>
                  <button className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200">
                    <Share className="w-4 h-4" />
                  </button>
                </div>
                <button className="text-zinc-400 hover:text-zinc-200">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Post 2 */}
            <div className="bg-zinc-900/60 rounded-xl border border-zinc-700/20 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="w-10 h-10 border border-zinc-700/50">
                    <AvatarImage src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9" alt="User avatar" />
                    <AvatarFallback>SK</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-zinc-200">Sarah Kim</h3>
                      <span className="ml-2 text-xs text-zinc-400">@sarahpoker</span>
                    </div>
                    <p className="text-xs text-zinc-400">4 hours ago</p>
                  </div>
                </div>
                <h2 className="text-lg font-medium mb-2 text-zinc-200">Tough Tournament Decision - ICM Spot</h2>
                <p className="text-zinc-300 mb-4">
                  Final table bubble in a $500 tournament. 10 players left, 9 get paid. I have AK suited in the BB facing a UTG shove for 15BB. Villain has been tight, but ICM pressure is real. What's the play?
                </p>
                <div className="bg-zinc-800/40 rounded-xl p-3 mb-4 border border-zinc-700/30">
                  <div className="flex justify-between text-sm text-zinc-400 mb-2">
                    <span>$500 Tournament - Final Table</span>
                    <span>Blinds: 4k/8k</span>
                  </div>
                  <div className="flex space-x-2 mb-2">
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">Tournament</span>
                    <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">ICM Decision</span>
                    <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">Bubble Play</span>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-800/30 px-4 py-3 flex items-center justify-between border-t border-zinc-700/20">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200">
                    <ThumbsUp className="w-4 h-4" />
                    <span>24</span>
                  </button>
                  <button className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200">
                    <MessageCircle className="w-4 h-4" />
                    <span>8</span>
                  </button>
                  <button className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200">
                    <Share className="w-4 h-4" />
                  </button>
                </div>
                <button className="text-zinc-400 hover:text-zinc-200">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-64 fixed right-0 h-[calc(100vh-4rem)] overflow-y-auto pt-6">
          <div className="px-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Trending Topics</h3>
            <div className="space-y-2">
              <div className="bg-zinc-900/60 rounded-xl border border-zinc-700/20 p-3">
                <h4 className="text-zinc-200 font-medium text-sm">#WorldSeries2024</h4>
                <p className="text-zinc-400 text-xs">2.3k posts</p>
              </div>
              <div className="bg-zinc-900/60 rounded-xl border border-zinc-700/20 p-3">
                <h4 className="text-zinc-200 font-medium text-sm">#CashGameStrategy</h4>
                <p className="text-zinc-400 text-xs">1.8k posts</p>
              </div>
              <div className="bg-zinc-900/60 rounded-xl border border-zinc-700/20 p-3">
                <h4 className="text-zinc-200 font-medium text-sm">#BluffCatcher</h4>
                <p className="text-zinc-400 text-xs">945 posts</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Feed;
