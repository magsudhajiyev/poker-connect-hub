
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, House, Bell, Share, ArrowLeft, Image, Table, Video, Plus
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { useNavigate } from 'react-router-dom';

const ShareHandContent = () => {
  const [handTitle, setHandTitle] = useState('');
  const [handDescription, setHandDescription] = useState('');
  const [handNotation, setHandNotation] = useState('');
  const [handTags, setHandTags] = useState('');
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();

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
        <GlobalSidebar />

        {/* Main Content */}
        <main className={`flex-1 px-4 py-6 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                Share a Hand
              </h1>
              <p className="text-zinc-400 mt-1">Share your poker hands with the community and get feedback</p>
            </div>
            <button 
              onClick={() => navigate('/feed')}
              className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Feed</span>
            </button>
          </div>
          
          {/* Hand Submission Form */}
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-700/20 p-6 mb-6">
            {/* Hand Title */}
            <div className="mb-5">
              <label htmlFor="hand-title" className="block text-sm font-medium text-zinc-400 mb-2">
                Hand Title
              </label>
              <Input
                type="text"
                id="hand-title"
                value={handTitle}
                onChange={(e) => setHandTitle(e.target.value)}
                className="w-full h-[50px] pl-4 pr-4 bg-zinc-800/60 rounded-xl border border-zinc-700/30 text-[15px] text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                placeholder="E.g. Hero Calls River Bet"
              />
            </div>
            
            {/* Hand Description */}
            <div className="mb-5">
              <label htmlFor="hand-description" className="block text-sm font-medium text-zinc-400 mb-2">
                Description
              </label>
              <Textarea
                id="hand-description"
                rows={4}
                value={handDescription}
                onChange={(e) => setHandDescription(e.target.value)}
                className="w-full pl-4 pr-4 pt-3 bg-zinc-800/60 rounded-xl border border-zinc-700/30 text-[15px] text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                placeholder="Describe the hand, your thought process, and outcome..."
              />
            </div>
            
            {/* Hand Content Upload */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Upload Hand Content</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="w-14 h-14 py-[15.20px] bg-zinc-900/60 rounded-xl shadow-[0px_4px_32px_0px_rgba(0,0,0,0.07)] border border-zinc-700/20 justify-center items-center inline-flex cursor-pointer hover:bg-zinc-800/60">
                  <div className="grow shrink basis-0 self-stretch pt-0.5 pb-[3.59px] bg-black/0 border-gray-200 flex-col justify-center items-center inline-flex">
                    <Plus className="w-5 h-5 text-zinc-400" />
                  </div>
                </div>
                <div className="w-14 h-14 py-[15.20px] bg-zinc-900/60 rounded-xl shadow-[0px_4px_32px_0px_rgba(0,0,0,0.07)] border border-zinc-700/20 justify-center items-center inline-flex cursor-pointer hover:bg-zinc-800/60">
                  <div className="grow shrink basis-0 self-stretch pt-0.5 pb-[3.59px] bg-black/0 border-gray-200 flex-col justify-center items-center inline-flex">
                    <Plus className="w-5 h-5 text-zinc-400" />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <button className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-200 py-2 px-3 bg-zinc-800/40 rounded-lg border border-zinc-700/30">
                  <Image className="w-4 h-4" />
                  <span>Add Image</span>
                </button>
                <button className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-200 py-2 px-3 bg-zinc-800/40 rounded-lg border border-zinc-700/30">
                  <Table className="w-4 h-4" />
                  <span>Upload Hand History</span>
                </button>
                <button className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-200 py-2 px-3 bg-zinc-800/40 rounded-lg border border-zinc-700/30">
                  <Video className="w-4 h-4" />
                  <span>Add Video</span>
                </button>
              </div>
            </div>
            
            {/* Hand Notation */}
            <div className="mb-5">
              <label htmlFor="hand-notation" className="block text-sm font-medium text-zinc-400 mb-2">
                Hand Notation (optional)
              </label>
              <Input
                type="text"
                id="hand-notation"
                value={handNotation}
                onChange={(e) => setHandNotation(e.target.value)}
                className="w-full h-[50px] pl-4 pr-4 bg-zinc-800/60 rounded-xl border border-zinc-700/30 text-[15px] text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                placeholder="E.g. AhKd vs QsQc on Jh8s2c5dTh"
              />
            </div>
            
            {/* Tags Input */}
            <div className="mb-5">
              <label htmlFor="hand-tags" className="block text-sm font-medium text-zinc-400 mb-2">
                Tags
              </label>
              <Input
                type="text"
                id="hand-tags"
                value={handTags}
                onChange={(e) => setHandTags(e.target.value)}
                className="w-full h-[50px] pl-4 pr-4 bg-zinc-800/60 rounded-xl border border-zinc-700/30 text-[15px] text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                placeholder="#bluff #tournament #NLHE"
              />
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <Button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-xl text-gray-800 font-medium hover:opacity-90">
                Share Hand
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const ShareHand = () => {
  return (
    <SidebarProvider>
      <ShareHandContent />
    </SidebarProvider>
  );
};

export default ShareHand;
