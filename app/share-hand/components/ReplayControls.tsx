'use client';

import { useState, useEffect } from 'react';
import { usePokerHandStore } from '@/stores/poker-hand-store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

export function ReplayControls({ handId }: { handId: string }) {
  const store = usePokerHandStore();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Load events when component mounts
    if (handId && store.eventAdapter) {
      store.loadEventsForReplay();
    }
  }, [handId, store.eventAdapter]);

  useEffect(() => {
    if (isPlaying && store.currentEventIndex < store.handEvents.length - 1) {
      const timer = setTimeout(() => {
        store.replayNext();
      }, 1000); // 1 second between events

      return () => clearTimeout(timer);
    } else if (isPlaying && store.currentEventIndex >= store.handEvents.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, store.currentEventIndex, store.handEvents.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    store.replayToEvent(value[0]);
  };

  if (!store.isReplaying || store.handEvents.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border rounded-lg p-4 shadow-lg w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Hand Replay</h3>
        <span className="text-sm text-muted-foreground">
          Event {store.currentEventIndex + 1} of {store.handEvents.length}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button
          size="icon"
          variant="outline"
          onClick={() => store.replayToEvent(0)}
          disabled={store.currentEventIndex === 0}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={() => store.replayPrevious()}
          disabled={store.currentEventIndex === 0}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="default"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={() => store.replayNext()}
          disabled={store.currentEventIndex >= store.handEvents.length - 1}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <Slider
        value={[store.currentEventIndex]}
        onValueChange={handleSeek}
        max={store.handEvents.length - 1}
        step={1}
        className="w-full"
      />

      {/* Event details */}
      {store.handEvents[store.currentEventIndex] && (
        <div className="mt-4 p-2 bg-muted rounded text-sm">
          <p className="font-medium">
            {store.handEvents[store.currentEventIndex].eventType}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            {JSON.stringify(store.handEvents[store.currentEventIndex].eventData, null, 2)}
          </p>
        </div>
      )}
    </div>
  );
}