// src/poker-engine/hooks/useHandReplay.ts
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { HandReplayService } from '../services/replay';
import { IPokerHand } from '@/types/poker-engine';
import { HandState } from '../core/state';
import { Street } from '@/types/poker';

export function useHandReplay(hand: IPokerHand) {
  const [replay] = useState(() => new HandReplayService(hand));
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [state, setState] = useState<HandState | null>(null);

  // Load initial state
  useEffect(() => {
    if (hand.snapshots.preflop) {
      // Quick load from snapshot
      const initialState = replay.loadAtStreet(Street.PREFLOP);
      setState(initialState);
    } else {
      // Start from beginning
      replay.jumpToAction(0);
      setState(replay.getCurrentState());
      setCurrentEventIndex(0);
    }
  }, [hand, replay]);

  // Navigation functions
  const nextAction = useCallback(() => {
    const newState = replay.nextAction();
    if (newState) {
      setState(newState);
      setCurrentEventIndex((prev) => prev + 1);
    }
  }, [replay]);

  const previousAction = useCallback(() => {
    const newState = replay.previousAction();
    if (newState) {
      setState(newState);
      setCurrentEventIndex((prev) => prev - 1);
    }
  }, [replay]);

  const jumpToAction = useCallback(
    (index: number) => {
      const newState = replay.jumpToAction(index);
      setState(newState);
      setCurrentEventIndex(index);
    },
    [replay],
  );

  const jumpToStreet = useCallback(
    (street: Street) => {
      const newState = replay.loadAtStreet(street);
      setState(newState);
      // Find the event index for this street
      const streetIndex = hand.events.findIndex(
        (e) => e.type === 'STREET_COMPLETED' && (e as any).data.street === street,
      );
      setCurrentEventIndex(streetIndex);
    },
    [replay, hand],
  );

  // Get timeline for UI
  const timeline = useMemo(() => replay.getActionTimeline(), [replay]);

  // Playback controls
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackSpeed = useRef(1000); // ms between actions

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval = setInterval(() => {
      const newState = replay.nextAction();
      if (newState) {
        setState(newState);
        setCurrentEventIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false); // End of hand
      }
    }, playbackSpeed.current);

    return () => clearInterval(interval);
  }, [isPlaying, replay]);

  return {
    state,
    currentEventIndex,
    timeline,

    // Navigation
    nextAction,
    previousAction,
    jumpToAction,
    jumpToStreet,

    // Playback
    isPlaying,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    setSpeed: (speed: number) => {
      playbackSpeed.current = speed;
    },

    // Info
    totalEvents: hand.events.length,
    canGoNext: currentEventIndex < hand.events.length - 1,
    canGoPrevious: currentEventIndex > 0,
  };
}
