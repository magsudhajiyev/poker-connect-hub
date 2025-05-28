
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
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Share2, Upload, Camera, Plus, X } from 'lucide-react';

const ShareHandContent = () => {
  const { isCollapsed } = useSidebar();
  const [currentStep, setCurrentStep] = useState(0);
  const [tags, setTags] = useState<string[]>(['bluff', 'tournament']);
  
  const [formData, setFormData] = useState({
    gameType: '',
    stackSize: '',
    heroPosition: '',
    villainPosition: '',
    preflopAction: '',
    preflopBet: '',
    flopCards: '',
    flopAction: '',
    turnCard: '',
    turnAction: '',
    riverCard: '',
    riverAction: '',
    title: '',
    description: ''
  });

  const steps = [
    { id: 'game-setup', title: 'Game Setup', description: 'Basic game information' },
    { id: 'preflop', title: 'Preflop', description: 'Preflop action and betting' },
    { id: 'flop', title: 'Flop', description: 'Flop cards and action' },
    { id: 'turn', title: 'Turn', description: 'Turn card and action' },
    { id: 'river', title: 'River', description: 'River card and final action' }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Submitting hand:', formData, tags);
    // TODO: Implement submission logic
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Game Setup
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Game Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="game-type" className="text-slate-300">Game Type</Label>
                <Select value={formData.gameType} onValueChange={(value) => setFormData({...formData, gameType: value})}>
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
                <Label htmlFor="stack-size" className="text-slate-300">Stack Size (BB)</Label>
                <Input
                  id="stack-size"
                  value={formData.stackSize}
                  onChange={(e) => setFormData({...formData, stackSize: e.target.value})}
                  placeholder="100"
                  className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hero-position" className="text-slate-300">Hero Position</Label>
                <Select value={formData.heroPosition} onValueChange={(value) => setFormData({...formData, heroPosition: value})}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="utg">UTG</SelectItem>
                    <SelectItem value="mp">Middle Position</SelectItem>
                    <SelectItem value="co">Cut Off</SelectItem>
                    <SelectItem value="btn">Button</SelectItem>
                    <SelectItem value="sb">Small Blind</SelectItem>
                    <SelectItem value="bb">Big Blind</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="villain-position" className="text-slate-300">Villain Position</Label>
                <Select value={formData.villainPosition} onValueChange={(value) => setFormData({...formData, villainPosition: value})}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="utg">UTG</SelectItem>
                    <SelectItem value="mp">Middle Position</SelectItem>
                    <SelectItem value="co">Cut Off</SelectItem>
                    <SelectItem value="btn">Button</SelectItem>
                    <SelectItem value="sb">Small Blind</SelectItem>
                    <SelectItem value="bb">Big Blind</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 1: // Preflop
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Preflop Action</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preflop-action" className="text-slate-300">Your Action</Label>
                <Select value={formData.preflopAction} onValueChange={(value) => setFormData({...formData, preflopAction: value})}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="fold">Fold</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="raise">Raise</SelectItem>
                    <SelectItem value="3bet">3-Bet</SelectItem>
                    <SelectItem value="4bet">4-Bet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="preflop-bet" className="text-slate-300">Bet Size (BB)</Label>
                <Input
                  id="preflop-bet"
                  value={formData.preflopBet}
                  onChange={(e) => setFormData({...formData, preflopBet: e.target.value})}
                  placeholder="2.5"
                  className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Flop
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Flop</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="flop-cards" className="text-slate-300">Flop Cards</Label>
                <Input
                  id="flop-cards"
                  value={formData.flopCards}
                  onChange={(e) => setFormData({...formData, flopCards: e.target.value})}
                  placeholder="A♠ K♥ 7♣"
                  className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                />
              </div>
              
              <div>
                <Label htmlFor="flop-action" className="text-slate-300">Your Action</Label>
                <Select value={formData.flopAction} onValueChange={(value) => setFormData({...formData, flopAction: value})}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="bet">Bet</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="raise">Raise</SelectItem>
                    <SelectItem value="fold">Fold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3: // Turn
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Turn</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="turn-card" className="text-slate-300">Turn Card</Label>
                <Input
                  id="turn-card"
                  value={formData.turnCard}
                  onChange={(e) => setFormData({...formData, turnCard: e.target.value})}
                  placeholder="Q♠"
                  className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                />
              </div>
              
              <div>
                <Label htmlFor="turn-action" className="text-slate-300">Your Action</Label>
                <Select value={formData.turnAction} onValueChange={(value) => setFormData({...formData, turnAction: value})}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="bet">Bet</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="raise">Raise</SelectItem>
                    <SelectItem value="fold">Fold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4: // River
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-200 mb-4">River & Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="river-card" className="text-slate-300">River Card</Label>
                <Input
                  id="river-card"
                  value={formData.riverCard}
                  onChange={(e) => setFormData({...formData, riverCard: e.target.value})}
                  placeholder="2♦"
                  className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                />
              </div>
              
              <div>
                <Label htmlFor="river-action" className="text-slate-300">Your Action</Label>
                <Select value={formData.riverAction} onValueChange={(value) => setFormData({...formData, riverAction: value})}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="bet">Bet</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="raise">Raise</SelectItem>
                    <SelectItem value="fold">Fold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title" className="text-slate-300">Hand Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Give your hand a catchy title"
                className="bg-slate-900/50 border-slate-700/50 text-slate-200"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-300">Hand Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the action, your thought process, and what happened..."
                rows={4}
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
          </div>
        );

      default:
        return null;
    }
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
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-200 mb-2">Share Your Hand</h1>
                <p className="text-slate-400">Tell the community about your poker experience</p>
              </div>
              <Button variant="outline" className="border-slate-700/50 text-slate-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Feed
              </Button>
            </div>

            <Card className="bg-slate-800/40 border-slate-700/30">
              <CardHeader>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-200">Hand Details</h2>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-slate-400">
                      {steps.map((step, index) => (
                        <span key={step.id} className={index <= currentStep ? 'text-emerald-400' : ''}>
                          {step.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Step Content */}
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="border-slate-700/50 text-slate-300 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleSubmit}
                      className="border-slate-700/50 text-slate-300"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Now
                    </Button>
                    
                    {currentStep < steps.length - 1 ? (
                      <Button
                        onClick={nextStep}
                        className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900"
                      >
                        Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Complete & Share
                      </Button>
                    )}
                  </div>
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
