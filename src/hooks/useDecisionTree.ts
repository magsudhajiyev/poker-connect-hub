
import { useState, useCallback } from 'react';
import { VisualActionNode, buildTreeFromFormData, getActionOrder } from '@/utils/pokerDecisionTree';

export const useDecisionTree = (formData: any) => {
  const [treeData, setTreeData] = useState<VisualActionNode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTree = useCallback(async () => {
    if (!formData.players || formData.players.length < 2) {
      setError('Need at least 2 players to generate decision tree');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('Generating decision tree for players:', formData.players);
      
      const tree = buildTreeFromFormData(formData);
      setTreeData(tree);
      
      console.log('Decision tree generated successfully:', tree);
    } catch (err) {
      console.error('Error generating decision tree:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate decision tree');
    } finally {
      setIsGenerating(false);
    }
  }, [formData]);

  const getPlayerActionOrder = useCallback(() => {
    if (!formData.players || formData.players.length < 2) {
      return [];
    }

    const activePositions = formData.players
      .filter((p: any) => p.position)
      .map((p: any) => p.position.toUpperCase());

    return getActionOrder(activePositions);
  }, [formData.players]);

  const canGenerateTree = formData.players && formData.players.length >= 2;

  return {
    treeData,
    isGenerating,
    error,
    generateTree,
    getPlayerActionOrder,
    canGenerateTree
  };
};
