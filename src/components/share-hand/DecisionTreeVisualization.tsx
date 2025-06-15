
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TreePine, Eye, EyeOff } from 'lucide-react';
import { VisualActionNode, buildTreeFromFormData } from '@/utils/pokerDecisionTree';

interface DecisionTreeVisualizationProps {
  formData: any;
  isVisible?: boolean;
}

const DecisionTreeNode = ({ 
  node, 
  depth = 0, 
  isLast = false, 
  path = '' 
}: { 
  node: VisualActionNode; 
  depth?: number; 
  isLast?: boolean; 
  path?: string; 
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels
  
  const hasChildren = node.children && node.children.length > 0;
  const indent = depth * 20;
  
  return (
    <div className="relative">
      <div 
        className="flex items-center space-x-2 py-1 hover:bg-slate-800/30 rounded"
        style={{ paddingLeft: `${indent}px` }}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 h-6 w-6"
          >
            {isExpanded ? '−' : '+'}
          </Button>
        )}
        
        {!hasChildren && <div className="w-6" />}
        
        <div className="flex-1 text-sm">
          <span className="text-slate-300">{node.name}</span>
          {node.pot !== undefined && (
            <Badge variant="secondary" className="ml-2 text-xs bg-emerald-500/20 text-emerald-400">
              Pot: ${node.pot}
            </Badge>
          )}
          {node.isAllIn && (
            <Badge variant="secondary" className="ml-1 text-xs bg-red-500/20 text-red-400">
              ALL-IN
            </Badge>
          )}
          {node.isFinal && (
            <Badge variant="secondary" className="ml-1 text-xs bg-blue-500/20 text-blue-400">
              FINAL
            </Badge>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {node.children!.map((child, index) => (
            <DecisionTreeNode
              key={index}
              node={child}
              depth={depth + 1}
              isLast={index === node.children!.length - 1}
              path={`${path}-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DecisionTreeVisualization = ({ 
  formData, 
  isVisible = false 
}: DecisionTreeVisualizationProps) => {
  const [treeData, setTreeData] = useState<VisualActionNode | null>(null);
  const [showTree, setShowTree] = useState(isVisible);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTree = async () => {
    setIsGenerating(true);
    try {
      const tree = buildTreeFromFormData(formData);
      setTreeData(tree);
      console.log('Generated decision tree:', tree);
    } catch (error) {
      console.error('Error generating decision tree:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (formData.players && formData.players.length >= 2) {
      generateTree();
    }
  }, [formData.players]);

  if (!formData.players || formData.players.length < 2) {
    return (
      <Card className="bg-slate-900/60 border-slate-700/20">
        <CardContent className="pt-6">
          <div className="text-center text-slate-400">
            <TreePine className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Add at least 2 players to generate decision tree</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/60 border-slate-700/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TreePine className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-slate-200">Decision Tree Analysis</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateTree}
              disabled={isGenerating}
              className="border-slate-700/50 text-slate-300 hover:text-slate-200"
            >
              {isGenerating ? 'Generating...' : 'Regenerate'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTree(!showTree)}
              className="border-slate-700/50 text-slate-300 hover:text-slate-200"
            >
              {showTree ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {showTree && (
        <CardContent>
          {treeData ? (
            <div className="space-y-2">
              <div className="text-sm text-slate-400 mb-4">
                Explore all possible action paths from the current hand state
              </div>
              <div className="bg-slate-800/40 rounded-lg p-4 max-h-96 overflow-y-auto">
                <DecisionTreeNode node={treeData} />
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <TreePine className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No decision tree generated</p>
              <Button
                variant="outline"
                size="sm"
                onClick={generateTree}
                className="mt-2 border-slate-700/50 text-slate-300 hover:text-slate-200"
              >
                Generate Tree
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default DecisionTreeVisualization;
