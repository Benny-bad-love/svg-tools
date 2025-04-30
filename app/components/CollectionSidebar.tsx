"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FolderIcon, ChevronRightIcon, ChevronDownIcon, PlusIcon, XMarkIcon, TrashIcon, ChevronLeftIcon, DragHandleIcon } from './Icons';
import { useCollections } from "../context/CollectionsContext";
import { useSvg } from "../context/SvgContext";

export const CollectionSidebar: React.FC = () => {
  const {
    collections,
    activeCollection,
    activeFolder,
    draggedItem,
    dragOverItem,
    setActiveCollection,
    setActiveFolder,
    addCollection,
    removeCollection,
    toggleCollectionOpen,
    addFolder,
    removeFolder,
    toggleFolderOpen,
    saveSvgToFolder,
    loadSvgFromFolder,
    removeSvgFromFolder,
    setDraggedItem,
    setDragOverItem,
    handleItemDrop
  } = useCollections();

  const { svgCode, fileName, isValidSvg } = useSvg();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const minWidth = 200;
  const maxWidth = 600;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startResizing = useCallback((_mouseDownEvent: React.MouseEvent) => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth = mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left;
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const handleAddCollection = () => {
    if (!newCollectionName.trim()) return;
    addCollection(newCollectionName);
    setNewCollectionName("");
    setShowNewCollectionInput(false);
  };

  const handleAddFolder = (collectionId: string) => {
    if (!newFolderName.trim()) return;
    addFolder(collectionId, newFolderName);
    setNewFolderName("");
    setShowNewFolderInput(false);
  };

  const handleSaveSvg = (collectionId: string, folderId: string) => {
    if (!svgCode.trim() || !isValidSvg) {
      alert("Please enter valid SVG code first");
      return;
    }
    saveSvgToFolder(collectionId, folderId, fileName, svgCode);
    alert(`SVG saved to collection!`);
  };

  const handleDragStart = (e: React.DragEvent, type: 'collection' | 'folder' | 'svg', id: string, parentId?: string) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add('dragging');

      if (type === 'svg') {
        try {
          const svgEl = e.currentTarget.querySelector('div[dangerouslySetInnerHTML]');
          if (svgEl) {
            e.dataTransfer.setDragImage(svgEl, 20, 20);
          }
        } catch {
          console.log('Could not set custom drag image');
        }
      }
    }

    setIsDragging(true);
    setDraggedItem({ type, id, parentId });
    e.dataTransfer.setData('text/plain', JSON.stringify({ type, id, parentId }));

    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, type: 'collection' | 'folder' | 'svg', id: string, parentId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem) return;
    if (draggedItem.id === id && draggedItem.type === type) return;

    if (draggedItem.type !== type) return;

    if (type === 'folder' && draggedItem.parentId !== parentId) return;

    if (type === 'svg' && draggedItem.parentId !== parentId) return;

    if (dragOverItem?.id !== id || dragOverItem?.type !== type) {
      setDragOverItem({ type, id, parentId });
    }

    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('dragging');
    }
    setIsDragging(false);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleItemDrop();
    handleDragEnd(e);
  };

  return (
    <>
      <style jsx global>{`
        .drag-target {
          transition: opacity 0.2s, transform 0.1s;
          position: relative;
        }
        .drag-target.is-drop-target {
          box-shadow: 0 0 0 2px #10b981;
          z-index: 5;
        }
        .drag-target.is-drop-target::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: -2px;
          height: 4px;
          background-color: #10b981;
          z-index: 1;
          border-radius: 2px;
        }
        .drag-target[data-type="collection"].is-drop-target {
          transform: translateY(2px);
          background-color: rgba(16, 185, 129, 0.15) !important;
          border-color: #10b981 !important;
        }
        .drag-target[data-type="collection"].is-drop-target::before {
          height: 4px;
          top: -1px;
          left: -1px;
          right: -1px;
          background-color: #10b981;
          border-radius: 2px;
        }
        .drag-target[data-type="collection"].dragging {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .drag-target[data-type="folder"].is-drop-target {
          background-color: rgba(16, 185, 129, 0.05);
          transform: translateX(2px);
        }
        .drag-target[data-type="svg"].is-drop-target {
          background-color: rgba(16, 185, 129, 0.1);
          transform: scale(1.05);
          border-color: #10b981 !important;
        }
        .drag-target[data-type="svg"].is-drop-target::before {
          height: 3px;
          top: -1px;
          left: -1px;
          right: -1px;
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
        }
        .dragging {
          opacity: 0.4;
          cursor: grabbing;
        }
        .drag-target[data-type="svg"].dragging {
          transform: scale(0.95);
          opacity: 0.6;
        }
      `}</style>

      <div
        ref={sidebarRef}
        className={`h-screen flex flex-shrink-0 transition-all duration-100 ${isResizing ? '!duration-0' : ''}`}
        style={{ width: sidebarOpen ? `${sidebarWidth}px` : '0px' }}
      >
        <aside
          className={`relative h-full bg-gray-100 dark:bg-gray-900 overflow-y-auto flex-1 flex flex-col transition-opacity duration-100 ${
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          } ${
            isResizing ? 'select-none' : ''
          }`}
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Collections</h2>
              <button
                onClick={() => setShowNewCollectionInput(true)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                title="Add new collection"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>

            {showNewCollectionInput && (
              <div className="mb-4 p-2 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="Collection name"
                    className="flex-1 px-2 py-1 text-sm border rounded"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCollectionName.trim()) {
                        handleAddCollection();
                      } else if (e.key === 'Escape') {
                        setShowNewCollectionInput(false);
                        setNewCollectionName("");
                      }
                    }}
                  />
                  <button
                    onClick={handleAddCollection}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowNewCollectionInput(false);
                      setNewCollectionName("");
                    }}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {collections
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map(collection => (
                <div
                  key={collection.id}
                  className={`border rounded-lg overflow-hidden ${
                    activeCollection === collection.id
                      ? "border-blue-500 dark:border-blue-400 shadow-sm"
                      : "dark:border-gray-700"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between p-2 cursor-pointer drag-target ${
                      activeCollection === collection.id
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "bg-gray-200 dark:bg-gray-800"
                    } ${
                      dragOverItem?.type === 'collection' && dragOverItem?.id === collection.id ? 'is-drop-target' : ''
                    }`}
                    data-type="collection"
                    draggable={true}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      handleDragStart(e, 'collection', collection.id);
                    }}
                    onDragOver={(e) => {
                      e.stopPropagation();
                      handleDragOver(e, 'collection', collection.id);
                    }}
                    onDragLeave={(e) => {
                      e.stopPropagation();
                      handleDragLeave();
                    }}
                    onDragEnd={(e) => {
                      e.stopPropagation();
                      handleDragEnd(e);
                    }}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleDrop(e);
                    }}
                  >
                    <div
                      className="flex items-center flex-1"
                      onClick={() => {
                        toggleCollectionOpen(collection.id);
                        setActiveCollection(collection.id);
                      }}
                    >
                      <div
                        className="mr-1 cursor-move opacity-30 hover:opacity-100"
                        title="Drag to reorder collection"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <DragHandleIcon className="w-3 h-3" />
                      </div>
                      {collection.isOpen ? (
                        <ChevronDownIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4 mr-1" />
                      )}
                      <span className="font-medium">{collection.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCollection(collection.id);
                          setShowNewFolderInput(true);
                        }}
                        className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700"
                        title="Add folder"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Are you sure you want to delete this collection and all its contents?")) {
                            removeCollection(collection.id);
                          }
                        }}
                        className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                        title="Delete collection"
                      >
                        <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>

                  {showNewFolderInput && activeCollection === collection.id && (
                    <div className="p-2 bg-gray-100 dark:bg-gray-900 border-t dark:border-gray-700">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="Folder name"
                          className="flex-1 px-2 py-1 text-sm border rounded"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newFolderName.trim()) {
                              handleAddFolder(collection.id);
                            } else if (e.key === 'Escape') {
                              setShowNewFolderInput(false);
                              setNewFolderName("");
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddFolder(collection.id)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowNewFolderInput(false);
                            setNewFolderName("");
                          }}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {collection.isOpen && (
                    <div className="p-2 bg-gray-50 dark:bg-gray-900">
                      {collection.folders.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No folders yet</p>
                      ) : (
                        <div className="space-y-2">
                          {collection.folders
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map(folder => (
                            <div
                              key={folder.id}
                              className={`ml-2 drag-target ${
                                dragOverItem?.type === 'folder' && dragOverItem?.id === folder.id ? 'is-drop-target' : ''
                              }`}
                              data-type="folder"
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, 'folder', folder.id, collection.id)}
                              onDragOver={(e) => handleDragOver(e, 'folder', folder.id, collection.id)}
                              onDragLeave={handleDragLeave}
                              onDragEnd={handleDragEnd}
                              onDrop={handleDrop}
                            >
                              <div
                                className={`flex items-center p-1 rounded cursor-pointer ${
                                  activeFolder === folder.id && activeCollection === collection.id
                                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                              >
                                <div
                                  className="flex items-center flex-1"
                                  onClick={() => {
                                    toggleFolderOpen(collection.id, folder.id);
                                    setActiveFolder(folder.id);
                                    setActiveCollection(collection.id);
                                  }}
                                >
                                  <div
                                    className="mr-1 cursor-move opacity-30 hover:opacity-100"
                                    title="Drag to reorder"
                                    onMouseDown={(e) => e.stopPropagation()}
                                  >
                                    <DragHandleIcon className="w-3 h-3" />
                                  </div>
                                  {folder.isOpen ? (
                                    <ChevronDownIcon className="w-3 h-3 mr-1" />
                                  ) : (
                                    <ChevronRightIcon className="w-3 h-3 mr-1" />
                                  )}
                                  <FolderIcon className="w-4 h-4 mr-1 text-yellow-500" />
                                  <span className="text-sm">{folder.name}</span>
                                </div>

                                <div className="flex items-center space-x-1">
                                  {svgCode && isValidSvg && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveSvg(collection.id, folder.id);
                                      }}
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                      title="Save current SVG to this folder"
                                    >
                                      Save
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm("Are you sure you want to delete this folder and all its contents?")) {
                                        removeFolder(collection.id, folder.id);
                                      }
                                    }}
                                    className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                                    title="Delete folder"
                                  >
                                    <TrashIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                                  </button>
                                </div>
                              </div>

                              {folder.isOpen && (
                                <div
                                  className="ml-6 mt-1 grid grid-cols-2 gap-2"
                                  onDragOver={(e) => {
                                    e.stopPropagation();
                                    if (draggedItem?.type === 'svg') {
                                      e.preventDefault();
                                    }
                                  }}
                                >
                                  {folder.items.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic col-span-2">No SVGs saved yet</p>
                                  ) : (
                                    folder.items
                                      .sort((a, b) => a.sortOrder - b.sortOrder)
                                      .map(item => (
                                      <div
                                        key={item.id}
                                        className={`drag-target aspect-square relative border rounded p-1 cursor-pointer ${
                                          svgCode === item.svgCode
                                            ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/10"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                        } ${
                                          dragOverItem?.type === 'svg' && dragOverItem?.id === item.id ? 'is-drop-target' : ''
                                        }`}
                                        data-type="svg"
                                        draggable={true}
                                        onDragStart={(e) => {
                                          console.log('SVG drag start');
                                          e.stopPropagation();
                                          handleDragStart(e, 'svg', item.id, `${collection.id}:${folder.id}`);
                                        }}
                                        onDragOver={(e) => {
                                          e.stopPropagation();
                                          handleDragOver(e, 'svg', item.id, `${collection.id}:${folder.id}`);
                                        }}
                                        onDragLeave={(e) => {
                                          e.stopPropagation();
                                          handleDragLeave();
                                        }}
                                        onDragEnd={(e) => {
                                          e.stopPropagation();
                                          handleDragEnd(e);
                                        }}
                                        onDrop={(e) => {
                                          e.stopPropagation();
                                          handleDrop(e);
                                        }}
                                        onMouseDown={(e) => {
                                          if (e.button === 0) {
                                            const isHandle = (e.target as HTMLElement).closest('.drag-handle') !== null;
                                            const isDelBtn = (e.target as HTMLElement).closest('.delete-btn') !== null;

                                            if (!isHandle && !isDelBtn) {
                                              console.log('SVG mousedown (not on handle)');
                                            }
                                          }
                                        }}
                                        onClick={(e) => {
                                          const isHandle = (e.target as HTMLElement).closest('.drag-handle') !== null;
                                          const isDelBtn = (e.target as HTMLElement).closest('.delete-btn') !== null;

                                          if (!isHandle && !isDelBtn && !isDragging) {
                                            console.log('SVG click - loading:', item.id);
                                            loadSvgFromFolder(item, collection.id, folder.id);
                                          } else {
                                            console.log('SVG click ignored - on handle, delete btn, or during drag');
                                          }
                                        }}
                                      >
                                        <div
                                          className="drag-handle absolute top-1 left-1 cursor-move opacity-30 hover:opacity-100 z-10 bg-white/70 dark:bg-gray-800/70 rounded-full p-0.5"
                                          title="Drag to reorder"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            console.log('Drag handle mousedown');
                                          }}
                                        >
                                          <DragHandleIcon className="w-3 h-3" />
                                        </div>

                                        <div
                                          className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-800 overflow-hidden"
                                          dangerouslySetInnerHTML={{ __html: item.svgCode }}
                                        ></div>
                                        <p className="text-xs mt-1 truncate">{item.name}</p>

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm("Are you sure you want to delete this SVG?")) {
                                              removeSvgFromFolder(collection.id, folder.id, item.id);
                                            }
                                          }}
                                          className="delete-btn absolute top-0 right-0 p-0.5 rounded-full bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800"
                                          title="Delete"
                                        >
                                          <XMarkIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                                        </button>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {collections.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center">
                  No collections yet. Create one to start saving SVGs!
                </p>
              )}
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="w-1.5 h-full cursor-col-resize bg-gray-300 dark:bg-gray-700 hover:bg-blue-500 active:bg-blue-600 transition-colors duration-100 flex-shrink-0"
            onMouseDown={startResizing}
          />
        )}
      </div>

      <button
        onClick={toggleSidebar}
        className={`fixed top-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow z-20 transition-all duration-300 ease-in-out`}
        style={{ left: sidebarOpen ? `${sidebarWidth + 8}px` : '8px' }}
        title={sidebarOpen ? "Hide Collections" : "Show Collections"}
      >
        {sidebarOpen ? (
          <ChevronLeftIcon className="w-5 h-5" />
        ) : (
          <ChevronRightIcon className="w-5 h-5" />
        )}
      </button>
    </>
  );
};