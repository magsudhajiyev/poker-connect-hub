
import { useState } from 'react';
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Camera, Plus, X } from 'lucide-react';

const ShareHandContent = () => {
  const { isCollapsed } = useSidebar();
  const [tags, setTags] = useState<string[]>(['bluff', 'tournament']);

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <ProfileTopBar />
      
      <div className="flex pt-16">
        <GlobalSidebar />

        {/* Main Content */}
        <main className={`flex-1 px-4 py-6 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-200 mb-2">Share Your Hand</h1>
              <p className="text-slate-400">Tell the community about your poker experience</p>
            </div>

            <Card className="bg-slate-800/40 border-slate-700/30">
              <CardHeader>
                <h2 className="text-xl font-semibold text-slate-200">Hand Details</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="game-type" className="text-slate-300">Game Type</Label>
                    <Select>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                        <SelectValue placeholder="Select game type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="nlhe">No Limit Hold'em</SelectItem>
                        <SelectItem value="plo">Pot Limit Omaha</SelectItem>
                        <SelectItem value="stud">Seven Card Stud</SelectItem>
                        <SelectItem value="mixed">Mixed Games</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="stakes" className="text-slate-300">Stakes</Label>
                    <Input
                      id="stakes"
                      placeholder="e.g., $1/$2, $500 tournament"
                      className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="title" className="text-slate-300">Hand Title</Label>
                  <Input
                    id="title"
                    placeholder="Give your hand a catchy title"
                    className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-slate-300">Hand Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the action, your thought process, and what happened..."
                    rows={6}
                    className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 mb-3 block">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addTag(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button variant="outline" size="sm" className="border-slate-700/50 text-slate-300">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300 mb-3 block">Upload Hand History or Screenshots</Label>
                  <div className="border-2 border-dashed border-slate-700/50 rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="flex space-x-4">
                        <Upload className="w-8 h-8 text-slate-400" />
                        <Camera className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-400">Drop files here or click to upload</p>
                      <p className="text-sm text-slate-500">Supports .txt, .jpg, .png files</p>
                      <Button variant="outline" className="border-slate-700/50 text-slate-300">
                        Choose Files
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button variant="outline" className="border-slate-700/50 text-slate-300">
                    Save as Draft
                  </Button>
                  <Button className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900">
                    Share Hand
                  </Button>
                </div>
              </CardContent>
            </Card>
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
