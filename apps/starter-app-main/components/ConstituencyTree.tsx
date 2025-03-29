"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ChevronRight, ChevronDown } from "lucide-react"
import Link from 'next/link'
import { indiaData } from "@/app/api/in-app-db/states"

type MemberType = { 
  username: string;
  hierarchyIndex?: number;
}

type TreeNode = {
  name?: string;
  members?: MemberType[];
  [key: string]: any;
}

const TreeItem = ({ 
  name, 
  node, 
  depth = 0, 
  showEmptyNodes = true,
  openAll = false
}: { 
  name?: string; 
  node: TreeNode;
  depth?: number;
  showEmptyNodes?: boolean;
  openAll?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(openAll);
  
  useEffect(() => {
    setIsOpen(openAll);
  }, [openAll]);
  
  // Collect all members for a node
  const collectAllMembers = (nodeToCollect: TreeNode, depth: number = 0): MemberType[] => {
    let allMembers: MemberType[] = [];

    // Collect direct members if exist
    if (nodeToCollect.members) {
      const directMembers: MemberType[] = nodeToCollect.members.map(member => {
        return {
          ...member,
          hierarchyIndex: depth
        };
      });
      
      allMembers = allMembers.concat(directMembers);
    }
    
    // Collect members from child nodes
    Object.entries(nodeToCollect)
      .filter(([key]) => key !== 'members' && typeof nodeToCollect[key] === 'object')
      .forEach(([key, childNode]) => {
        const childNodeTyped = childNode as TreeNode;
        const childMembers = collectAllMembers(childNodeTyped, depth + 1);
        allMembers = allMembers.concat(childMembers);
      });
    
    return allMembers;
  };

  // Dynamically determine if a node is a state-level node
  const isStateLevelNode = (node: TreeNode): boolean => {
    // A state-level node has multiple child nodes that are objects
    const childNodes = Object.entries(node)
      .filter(([key]) => key !== 'members' && typeof node[key] === 'object');
    
    return childNodes.length > 1;
  };

  // Determine if this is a parliamentary constituency
  const isParliamentary = !!(node.members && node.members.length > 0);

  // Check if node has any non-empty children
  const hasNonEmptyChildren = () => {
    return Object.entries(node)
      .filter(([key]) => key !== 'members')
      .some(([, childNode]) => 
        typeof childNode === 'object' && 
        (childNode.members && childNode.members.length > 0)
      );
  };

  // Determine if this node should be rendered
  const shouldRenderNode = () => {
    // Always show if showEmptyNodes is true
    if (showEmptyNodes) return true;
    
    // If node has members, show it
    if (node.members && node.members.length > 0) return true;
    
    // Check if any children have members
    return hasNonEmptyChildren();
  };

  // Skip rendering if node should be hidden
  if (!shouldRenderNode()) return null;

  // Determine node type suffix
  const getNodeSuffix = () => {
    if (depth === 0) return '(s)';  // State
    if (depth === 1) return '(p)';  // Parliamentary/District
    return '(a)';  // Assembly/Local
  };

  // Render members or zero state
  const renderMembers = () => {
    // Skip rendering for state-level nodes
    if (depth === 0) return null;

    if (!node.members || node.members.length === 0) {
      return (
        <div className="pl-4 text-muted-foreground italic text-sm">
          No members found for this constituency
        </div>
      );
    }

    return (
      <div className="pl-4">
        <div className="text-sm text-muted-foreground mb-2">Members:</div>
        {node.members.map((member, index) => (
          <div 
            key={index} 
            className="pl-2 text-sm flex items-center"
          >
            <span className="mr-2">•</span>
            <span>{member.username}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pl-4">
      <div 
        className="flex items-center gap-4 py-2 cursor-pointer hover:bg-accent rounded-md px-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-muted-foreground">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
        <div className="flex-grow capitalize">
          {name 
            ? `${name.toLowerCase().replace(/_/g, ' ')} ${getNodeSuffix()}` 
            : 'Constituency'}
        </div>
      </div>

      {isOpen && (
        <div>
          {/* Show members if exists */}
          {renderMembers()}

          {/* Display children */}
          <div className="pl-4">
            {Object.entries(node)
              .filter(([key]) => key !== 'members')
              .map(([key, childNode]) => (
                typeof childNode === 'object' && (
                  <TreeItem 
                    key={key} 
                    name={key} 
                    node={childNode} 
                    depth={depth + 1}
                    showEmptyNodes={showEmptyNodes}
                    openAll={openAll}
                  />
                )
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export function ConstituencyTree() {
  const [showEmptyNodes, setShowEmptyNodes] = useState(true);
  const [openAll, setOpenAll] = useState(false);

  // Function to collect all members across all states
  const collectAllMembers = () => {
    const allMembers: Array<{
      serialNumber: number,
      username: string,
      stateName: string,
      assemblyName: string,
      role?: 'mp' | 'mla' | 'local'
    }> = [];

    let serialNumber = 1;

    // Iterate through states
    Object.entries(indiaData).forEach(([stateName, stateData]) => {
      const collectMembers = (node: TreeNode, currentAssemblyName = '') => {
        // Collect direct members of the node
        if (node.members) {
          node.members.forEach(member => {
            // Determine role based on username suffix
            const role = member.username.endsWith('_mp') ? 'mp' :
                         member.username.endsWith('_mla') ? 'mla' :
                         'local';

            allMembers.push({
              serialNumber: serialNumber++,
              username: member.username,
              stateName,
              assemblyName: currentAssemblyName,
              role
            });
          });
        }

        // Recursively collect members from child nodes
        Object.entries(node)
          .filter(([key]) => key !== 'members' && typeof node[key] === 'object')
          .forEach(([key, childNode]) => {
            collectMembers(childNode as TreeNode, key);
          });
      };

      collectMembers(stateData);
    });

    return allMembers;
  };

  const allMembers = collectAllMembers();

  return (
    <Card className="p-4">
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="show-empty-nodes"
            checked={showEmptyNodes}
            onChange={() => setShowEmptyNodes(!showEmptyNodes)}
            className="mr-2"
          />
          <label htmlFor="show-empty-nodes" className="text-sm">
            Show Empty Nodes
          </label>
        </div>
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="open-all"
            checked={openAll}
            onChange={() => setOpenAll(!openAll)}
            className="mr-2"
          />
          <label htmlFor="open-all" className="text-sm">
            Toggle Open All
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column - Constituency Tree */}
        <div className="border rounded-md p-4">
          {Object.entries(indiaData).map(([stateName, stateData]) => (
            <TreeItem 
              key={stateName} 
              name={stateName} 
              node={stateData} 
              showEmptyNodes={showEmptyNodes}
              openAll={openAll}
            />
          ))}
        </div>

        {/* Right Column - Members Grid */}
        <div className="border rounded-md p-4">
          <h2 className="text-lg font-bold mb-4">All Members</h2>
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">S.No</th>
                  <th className="border p-2 text-left">Username</th>
                </tr>
              </thead>
              <tbody>
                {allMembers.map((member) => (
                  <tr key={member.serialNumber} className="hover:bg-gray-50">
                    <td className="border p-2">{member.serialNumber}</td>
                    <td className="border p-2">
                      <Link 
                        href={`/${member.username}`} 
                        className="text-blue-600 hover:underline"
                      >
                        {member.username}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
} 