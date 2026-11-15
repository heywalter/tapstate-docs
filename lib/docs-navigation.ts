import type { Folder, Node, Root } from 'fumadocs-core/page-tree';

// Keep pages and URLs intact while turning metadata sections into real folders.
function sections(nodes: Node[], prefix: string): Node[] {
  const result: Node[] = [];
  let section: Folder | undefined;
  for (const node of nodes) {
    if (node.type === 'separator') {
      section = {
        type: 'folder',
        $id: `${prefix}-${result.length}`,
        name: node.name,
        collapsible: true,
        defaultOpen: false,
        children: [],
      };
      result.push(section);
    } else if (section) {
      section.children.push(node);
    } else {
      result.push(node);
    }
  }
  return result.filter((node) => node.type !== 'folder' || node.children.length > 0);
}

function expandable(node: Node): Node {
  if (node.type !== 'folder') {
    if (node.type !== 'page') return node;
    const labels: Record<string, string> = {
      '/docs/overview/order-state-demo': 'Order-state demo',
      '/docs/connectors': 'Overview',
      '/docs/self-hosted': 'Overview',
      '/docs/manage': 'Overview',
    };
    return labels[node.url] ? { ...node, name: labels[node.url] } : node;
  }
  const { index, ...folder } = node;
  const children = index
    ? [{ ...index, name: 'Overview' }, ...node.children.filter((child) =>
        child.type !== 'page' || child.url !== index.url)]
    : node.children;
  return {
    ...folder,
    collapsible: true,
    children: sections(children, node.$id ?? 'docs-section').map(expandable),
  };
}

export function organizeDocsNavigation(root: Root): Root {
  // Metadata owns the reader hierarchy, including references to existing pages
  // in other folders. Do not flatten groups based on their display labels.
  return { ...root, children: root.children.map(expandable) };
}
