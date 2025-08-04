// Client-safe types for event sourcing
// These types can be imported on both client and server

import { ActionType } from '@/types/poker';
import { IHandEvent } from '@/models/HandEvent';
import { HandState } from '@/poker-engine/core/state';

// Interface for EventSourcingAdapter that can be used on client
export interface IEventSourcingAdapter {
  processCommand(playerId: string, action: ActionType, amount?: number): Promise<{
    success: boolean;
    event?: IHandEvent;
    error?: string;
    validActions?: ActionType[];
  }>;
  
  getEvents(): Promise<IHandEvent[]>;
  
  getValidActions(): Promise<ActionType[]>;
  
  rebuildState(): Promise<{
    currentState: HandState;
    events: IHandEvent[];
    lastSequence: number;
  }>;
  
  replayToSequence(sequenceNumber: number): Promise<{
    currentState: HandState;
    events: IHandEvent[];
  }>;
}