
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Image, Video, Smile } from 'lucide-react';

export const PostComposer = () => {
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleShareHand = () => {
    navigate('/share-hand');
  };

  return (
    <Card className="bg-slate-800/40 border-slate-700/30 mb-6">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" />
            <AvatarFallback>MJ</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-slate-900/60 border-slate-700/30 text-slate-200 placeholder-slate-400 resize-none min-h-[60px] focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 p-2">
                  <Image className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Photo</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 p-2">
                  <Video className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Video</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 p-2">
                  <Smile className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Feeling</span>
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleShareHand}
                  className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900 hover:from-emerald-600 hover:to-violet-600 text-sm"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Hand
                </Button>
                <Button
                  disabled={!content.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
