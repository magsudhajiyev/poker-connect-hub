'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark, TrendingUp } from 'lucide-react';

interface SamplePostCardProps {
  item: number;
}

export const SamplePostCard = ({ item }: SamplePostCardProps) => {
  return (
    <Card className="bg-slate-800/40 border-slate-700/30">
      <CardHeader className="flex flex-row items-center space-y-0 pb-3">
        <UserAvatar
          src={`https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-${item + 1}.jpg`}
          name={`Player ${item}`}
          size="md"
          className="mr-2 sm:mr-3 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-200 font-medium text-sm sm:text-base truncate">
            Player {item}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm">{item}h ago</p>
        </div>
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-400 text-xs flex-shrink-0"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Hot Hand</span>
          <span className="sm:hidden">Hot</span>
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-slate-300 mb-4 text-sm sm:text-base break-words">
          Just hit a sick bluff with 7-2 offsuit on the river! Sometimes you gotta trust your reads
          🎯
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-red-400 p-1 sm:p-2"
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">{24 + item}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200 p-1 sm:p-2"
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">{8 + item}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200 p-1 sm:p-2"
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 p-1 sm:p-2"
          >
            <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
