import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from 'lucide-react';

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ElementType;
  children?: TreeNode[];
  onClick?: () => void;
}

interface TreeViewProps {
  data: TreeNode[];
  defaultExpanded?: string[];
  onNodeClick?: (node: TreeNode) => void;
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  expanded: boolean;
  onToggle: () => void;
  onNodeClick?: (node: TreeNode) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({ 
  node, 
  level, 
  expanded, 
  onToggle,
  onNodeClick 
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const Icon = node.icon || (hasChildren ? (expanded ? FolderOpen : Folder) : File);
  
  const handleClick = () => {
    if (hasChildren) {
      onToggle();
    }
    if (node.onClick) {
      node.onClick();
    }
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer
          hover:bg-gray-100 transition-colors
          ${level > 0 ? `ml-${level * 4}` : ''}
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {hasChildren && (
          <button 
            className="p-0.5 hover:bg-gray-200 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}
        
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{node.label}</span>
      </div>
      
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeItemWithState
              key={child.id}
              node={child}
              level={level + 1}
              defaultExpanded={false}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeItemWithState: React.FC<{
  node: TreeNode;
  level: number;
  defaultExpanded: boolean;
  onNodeClick?: (node: TreeNode) => void;
}> = ({ node, level, defaultExpanded, onNodeClick }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  return (
    <TreeItem
      node={node}
      level={level}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      onNodeClick={onNodeClick}
    />
  );
};

export const TreeView: React.FC<TreeViewProps> = ({ 
  data, 
  defaultExpanded = [],
  onNodeClick 
}) => {
  return (
    <div className="w-full">
      {data.map((node) => (
        <TreeItemWithState
          key={node.id}
          node={node}
          level={0}
          defaultExpanded={defaultExpanded.includes(node.id)}
          onNodeClick={onNodeClick}
        />
      ))}
    </div>
  );
};

export default TreeView;
