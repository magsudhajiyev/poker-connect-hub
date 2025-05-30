
import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export const HandViewComments = () => {
  const [comment, setComment] = useState('');

  return (
    <Card className="bg-slate-800/40 border-slate-700/30 w-full">
      <CardHeader>
        <h3 className="text-lg font-semibold text-slate-200">Comments</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Share your thoughts on this hand..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500 min-h-[100px] w-full"
          />
          <Button 
            disabled={!comment.trim()}
            className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900"
          >
            Post Comment
          </Button>
        </div>

        <div className="space-y-4 pt-4">
          <p className="text-slate-400 text-center">No comments yet. Be the first to share your analysis!</p>
        </div>
      </CardContent>
    </Card>
  );
};
