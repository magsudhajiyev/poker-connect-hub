'use client';


import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, Share2, ThumbsUp, MessageCircle } from 'lucide-react';
import { ShareHandFormData } from '@/types/shareHand';
import HandReplay from './HandReplay';
import { PotDisplayOptimized } from './poker-table/PotDisplayOptimized';

interface HandDisplayProps {
  formData: ShareHandFormData;
  tags: string[];
  getPositionName: (position: string) => string;
  getCurrencySymbol: () => string;
  calculatePotSize: () => number;
  authorName?: string;
  authorUsername?: string;
  authorAvatar?: string;
  createdAt?: Date;
  likes?: number;
  comments?: number;
}

const HandDisplay = ({ 
  formData, 
  tags, 
  getPositionName, 
  getCurrencySymbol, 
  calculatePotSize,
  authorName = 'Alex Rivera',
  authorUsername = '@pokerwizard',
  authorAvatar = 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
  createdAt = new Date(Date.now() - 2 * 60 * 60 * 1000),
  likes = 83,
  comments = 14,
}: HandDisplayProps) => {
  const potSize = calculatePotSize();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) {
return 'Just now';
}
    if (diffMins < 60) {
return `${diffMins}m ago`;
}
    if (diffMins < 1440) {
return `${Math.floor(diffMins / 60)}h ago`;
}
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <Card className="bg-slate-900/60 border-slate-700/20">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-3">
          <img 
            src={authorAvatar} 
            alt="User avatar" 
            className="w-10 h-10 rounded-full border border-slate-700/50"
          />
          <div>
            <div className="flex items-center">
              <h3 className="font-medium text-slate-200">{authorName}</h3>
              <span className="ml-2 text-xs text-slate-400">{authorUsername}</span>
            </div>
            <p className="text-xs text-slate-400">{formatTimeAgo(createdAt)}</p>
          </div>
          <div className="ml-auto flex space-x-2">
            <Button variant="outline" size="sm" className="border-slate-700/50 text-slate-400 hover:text-slate-200">
              <Bookmark className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="border-slate-700/50 text-slate-400 hover:text-slate-200">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
        
        <h2 className="text-lg font-medium mb-2 text-slate-200">
          {formData.title || 'Untitled Hand'}
        </h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-emerald-500/20 text-emerald-400">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="bg-slate-800/40 rounded-xl p-4 mb-4 border border-slate-700/30">
          <div className="flex flex-col md:flex-row justify-between mb-3">
            <div>
              <span className="text-slate-400 text-sm">
                {formData.gameFormat === 'cash' ? 'Cash Game' : 'Tournament'} - {formData.gameType}
              </span>
              <div className="flex mt-1">
                <span className="text-slate-300 font-medium">Hero: </span>
                <span className="ml-1 text-slate-300">
                  {getPositionName(formData.heroPosition)} ({getCurrencySymbol()}{formData.heroStackSize[0]})
                </span>
              </div>
              <div className="flex mt-1">
                <span className="text-slate-300 font-medium">Villain: </span>
                <span className="ml-1 text-slate-300">
                  {getPositionName(formData.villainPosition)} ({getCurrencySymbol()}{formData.villainStackSize[0]})
                </span>
              </div>
            </div>
            <div className="text-left md:text-right mt-3 md:mt-0">
              <PotDisplayOptimized pot={potSize} getCurrencySymbol={getCurrencySymbol} />
            </div>
          </div>
          
          <div className="border-t border-slate-700/30 pt-3 mt-3">
            {formData.description && (
              <p className="text-slate-300 mb-3">{formData.description}</p>
            )}
            <div className="flex justify-end space-x-3 mt-2">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 text-sm">{likes}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-violet-500" />
                <span className="text-violet-500 text-sm">{comments}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <HandReplay
          formData={formData}
          getPositionName={getPositionName}
          getCurrencySymbol={getCurrencySymbol}
        />
      </CardContent>
    </Card>
  );
};

export default HandDisplay;
