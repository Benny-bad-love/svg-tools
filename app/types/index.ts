// Types for SVG collection system
export type SVGItem = {
  id: string;
  name: string;
  svgCode: string;
  createdAt: number;
  sortOrder: number;
};

export type Folder = {
  id: string;
  name: string;
  items: SVGItem[];
  subFolders: Folder[];
  isOpen: boolean;
  sortOrder: number;
};

export type Collection = {
  id: string;
  name: string;
  folders: Folder[];
  isOpen: boolean;
  sortOrder: number;
};

export type DragItem = {
  type: 'collection' | 'folder' | 'svg';
  id: string;
  parentId?: string;
};