"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Collection, DragItem, SVGItem } from "../types";
import {
  createCollection,
  createFolder,
  deleteCollection,
  deleteFolder,
  deleteSvgFromFolder,
  loadCollections,
  saveCollections,
  saveSvgToFolder as saveToFolder,
  toggleCollection,
  toggleFolder
} from "../utils/collectionUtils";
import { handleDrop } from "../utils/dragDropUtils";
import { useSvg } from "./SvgContext";

type CollectionsContextType = {
  collections: Collection[];
  activeCollection: string | null;
  activeFolder: string | null;
  draggedItem: DragItem | null;
  dragOverItem: DragItem | null;

  // Collection actions
  setActiveCollection: (id: string | null) => void;
  setActiveFolder: (id: string | null) => void;
  addCollection: (name: string) => void;
  removeCollection: (id: string) => void;
  toggleCollectionOpen: (id: string) => void;

  // Folder actions
  addFolder: (collectionId: string, name: string) => void;
  removeFolder: (collectionId: string, folderId: string) => void;
  toggleFolderOpen: (collectionId: string, folderId: string) => void;

  // SVG actions
  saveSvgToFolder: (collectionId: string, folderId: string, name: string, svgCode: string) => void;
  loadSvgFromFolder: (item: SVGItem, collectionId: string, folderId: string) => void;
  removeSvgFromFolder: (collectionId: string, folderId: string, svgId: string) => void;

  // Drag and drop actions
  setDraggedItem: (item: DragItem | null) => void;
  setDragOverItem: (item: DragItem | null) => void;
  handleItemDrop: () => void;
};

export const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

export const CollectionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverItem, setDragOverItem] = useState<DragItem | null>(null);

  const { setSvgCode, setFileName } = useSvg();

  // Load collections on mount
  useEffect(() => {
    setCollections(loadCollections());
  }, []);

  // Save collections when they change
  useEffect(() => {
    saveCollections(collections);
  }, [collections]);

  // Collection actions
  const addCollection = (name: string) => {
    setCollections(createCollection(collections, name));
  };

  const removeCollection = (id: string) => {
    const newCollections = deleteCollection(collections, id);
    setCollections(newCollections);

    if (activeCollection === id) {
      setActiveCollection(null);
      setActiveFolder(null);
    }
  };

  const toggleCollectionOpen = (id: string) => {
    setCollections(toggleCollection(collections, id));
  };

  // Folder actions
  const addFolder = (collectionId: string, name: string) => {
    setCollections(createFolder(collections, collectionId, name));
  };

  const removeFolder = (collectionId: string, folderId: string) => {
    const newCollections = deleteFolder(collections, collectionId, folderId);
    setCollections(newCollections);

    if (activeFolder === folderId) {
      setActiveFolder(null);
    }
  };

  const toggleFolderOpen = (collectionId: string, folderId: string) => {
    setCollections(toggleFolder(collections, collectionId, folderId));
  };

  // SVG actions
  const saveSvgToFolder = (collectionId: string, folderId: string, name: string, svgCode: string) => {
    setCollections(saveToFolder(collections, collectionId, folderId, name, svgCode));
  };

  const loadSvgFromFolder = (item: SVGItem, collectionId: string, folderId: string): void => {
    setActiveCollection(collectionId);
    setActiveFolder(folderId);
    setSvgCode(item.svgCode);
    setFileName(item.name);
  };

  const removeSvgFromFolder = (collectionId: string, folderId: string, svgId: string) => {
    setCollections(deleteSvgFromFolder(collections, collectionId, folderId, svgId));
  };

  // Drag and drop actions
  const handleItemDrop = () => {
    if (draggedItem && dragOverItem) {
      setCollections(handleDrop(collections, draggedItem, dragOverItem));
    }
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const value = {
    collections,
    activeCollection,
    activeFolder,
    draggedItem,
    dragOverItem,

    // Collection actions
    setActiveCollection,
    setActiveFolder,
    addCollection,
    removeCollection,
    toggleCollectionOpen,

    // Folder actions
    addFolder,
    removeFolder,
    toggleFolderOpen,

    // SVG actions
    saveSvgToFolder,
    loadSvgFromFolder,
    removeSvgFromFolder,

    // Drag and drop actions
    setDraggedItem,
    setDragOverItem,
    handleItemDrop
  };

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
};

// Custom hook to use the collections context
export const useCollections = () => {
  const context = useContext(CollectionsContext);
  if (context === undefined) {
    throw new Error("useCollections must be used within a CollectionsProvider");
  }
  return context;
};