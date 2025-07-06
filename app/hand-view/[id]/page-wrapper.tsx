'use client';

import { HandViewContent } from '../components/HandViewContent';

interface HandViewPageWrapperProps {
  handId: string;
}

export default function HandViewPageWrapper({ handId }: HandViewPageWrapperProps) {
  return <HandViewContent handId={handId} />;
}
