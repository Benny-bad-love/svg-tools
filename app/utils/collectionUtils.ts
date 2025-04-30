import { Collection, Folder, SVGItem } from "../types";

/**
 * Load collections from localStorage
 * @returns Array of collections or empty array if none exist
 */
export const loadCollections = (): Collection[] => {
  if (typeof window === 'undefined') return [];

  const savedCollections = localStorage.getItem('svgCollections');
  if (!savedCollections) return [];

  let parsedCollections = JSON.parse(savedCollections);

  // Ensure collections have sortOrder property
  parsedCollections = parsedCollections.map((collection: Collection, index: number) => {
    // Add sortOrder if missing
    if (typeof collection.sortOrder !== 'number') {
      collection.sortOrder = index;
    }

    // Ensure folders have sortOrder
    collection.folders = collection.folders.map((folder: Folder, folderIndex: number) => {
      if (typeof folder.sortOrder !== 'number') {
        folder.sortOrder = folderIndex;
      }

      // Ensure items have sortOrder
      folder.items = folder.items.map((item: SVGItem, itemIndex: number) => {
        if (typeof item.sortOrder !== 'number') {
          item.sortOrder = itemIndex;
        }
        return item;
      }).sort((a: SVGItem, b: SVGItem) => a.sortOrder - b.sortOrder);

      return folder;
    }).sort((a: Folder, b: Folder) => a.sortOrder - b.sortOrder);

    return collection;
  }).sort((a: Collection, b: Collection) => a.sortOrder - b.sortOrder);

  return parsedCollections;
};

/**
 * Save collections to localStorage
 * @param collections Array of collections to save
 */
export const saveCollections = (collections: Collection[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('svgCollections', JSON.stringify(collections));
};

/**
 * Create a new collection
 * @param collections Current collections array
 * @param name Name of the new collection
 * @returns Updated collections array with new collection
 */
export const createCollection = (collections: Collection[], name: string): Collection[] => {
  if (!name.trim()) return collections;

  const newCollection: Collection = {
    id: `collection-${Date.now()}`,
    name,
    folders: [],
    isOpen: true,
    sortOrder: collections.length // Add to the end
  };

  return [...collections, newCollection];
};

/**
 * Create a new folder in a collection
 * @param collections Current collections array
 * @param collectionId ID of the collection to add folder to
 * @param name Name of the new folder
 * @returns Updated collections array with new folder
 */
export const createFolder = (collections: Collection[], collectionId: string, name: string): Collection[] => {
  if (!name.trim()) return collections;

  return collections.map(collection => {
    if (collection.id === collectionId) {
      return {
        ...collection,
        folders: [
          ...collection.folders,
          {
            id: `folder-${Date.now()}`,
            name,
            items: [],
            subFolders: [],
            isOpen: true,
            sortOrder: collection.folders.length // Add to the end
          }
        ]
      };
    }
    return collection;
  });
};

/**
 * Toggle collection open/closed state
 * @param collections Current collections array
 * @param collectionId ID of the collection to toggle
 * @returns Updated collections array with toggled collection
 */
export const toggleCollection = (collections: Collection[], collectionId: string): Collection[] => {
  return collections.map(collection => {
    if (collection.id === collectionId) {
      return { ...collection, isOpen: !collection.isOpen };
    }
    return collection;
  });
};

/**
 * Toggle folder open/closed state
 * @param collections Current collections array
 * @param collectionId ID of the parent collection
 * @param folderId ID of the folder to toggle
 * @returns Updated collections array with toggled folder
 */
export const toggleFolder = (collections: Collection[], collectionId: string, folderId: string): Collection[] => {
  return collections.map(collection => {
    if (collection.id === collectionId) {
      return {
        ...collection,
        folders: collection.folders.map(folder => {
          if (folder.id === folderId) {
            return { ...folder, isOpen: !folder.isOpen };
          }
          return folder;
        })
      };
    }
    return collection;
  });
};

/**
 * Delete a collection
 * @param collections Current collections array
 * @param collectionId ID of the collection to delete
 * @returns Updated collections array without the deleted collection
 */
export const deleteCollection = (collections: Collection[], collectionId: string): Collection[] => {
  return collections.filter(c => c.id !== collectionId);
};

/**
 * Delete a folder
 * @param collections Current collections array
 * @param collectionId ID of the parent collection
 * @param folderId ID of the folder to delete
 * @returns Updated collections array without the deleted folder
 */
export const deleteFolder = (collections: Collection[], collectionId: string, folderId: string): Collection[] => {
  return collections.map(collection => {
    if (collection.id === collectionId) {
      return {
        ...collection,
        folders: collection.folders.filter(folder => folder.id !== folderId)
      };
    }
    return collection;
  });
};

/**
 * Save an SVG to a folder
 * @param collections Current collections array
 * @param collectionId ID of the parent collection
 * @param folderId ID of the target folder
 * @param name Name of the SVG
 * @param svgCode SVG content
 * @returns Updated collections array with new SVG
 */
export const saveSvgToFolder = (
  collections: Collection[],
  collectionId: string,
  folderId: string,
  name: string,
  svgCode: string
): Collection[] => {
  if (!svgCode.trim()) return collections;

  const newSvgItem: SVGItem = {
    id: `svg-${Date.now()}`,
    name,
    svgCode,
    createdAt: Date.now(),
    sortOrder: 0 // Will be updated in the map below
  };

  return collections.map(collection => {
    if (collection.id === collectionId) {
      return {
        ...collection,
        folders: collection.folders.map(folder => {
          if (folder.id === folderId) {
            const updatedItems = [...folder.items, newSvgItem];
            // Update sort order for all items
            updatedItems.forEach((item, index) => {
              item.sortOrder = index;
            });

            return {
              ...folder,
              items: updatedItems
            };
          }
          return folder;
        })
      };
    }
    return collection;
  });
};

/**
 * Delete an SVG from a folder
 * @param collections Current collections array
 * @param collectionId ID of the parent collection
 * @param folderId ID of the parent folder
 * @param svgId ID of the SVG to delete
 * @returns Updated collections array without the deleted SVG
 */
export const deleteSvgFromFolder = (
  collections: Collection[],
  collectionId: string,
  folderId: string,
  svgId: string
): Collection[] => {
  return collections.map(collection => {
    if (collection.id === collectionId) {
      return {
        ...collection,
        folders: collection.folders.map(folder => {
          if (folder.id === folderId) {
            return {
              ...folder,
              items: folder.items.filter(item => item.id !== svgId)
            };
          }
          return folder;
        })
      };
    }
    return collection;
  });
};