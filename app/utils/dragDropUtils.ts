import { Collection, DragItem } from "../types";

/**
 * Handle collection reordering
 * @param collections Current collections array
 * @param draggedId ID of dragged collection
 * @param dropId ID of drop target collection
 * @returns Updated collections array with reordered collections
 */
export const reorderCollections = (collections: Collection[], draggedId: string, dropId: string): Collection[] => {
  if (draggedId === dropId) return collections;

  const collectionsCopy = [...collections];
  const draggedIndex = collectionsCopy.findIndex(c => c.id === draggedId);
  const dropIndex = collectionsCopy.findIndex(c => c.id === dropId);

  if (draggedIndex !== -1 && dropIndex !== -1) {
    // Remove dragged item
    const [removed] = collectionsCopy.splice(draggedIndex, 1);
    // Insert at new position
    collectionsCopy.splice(dropIndex, 0, removed);

    // Update sort order
    collectionsCopy.forEach((collection, index) => {
      collection.sortOrder = index * 100; // Use multiplier to leave space between items
    });

    return collectionsCopy;
  }

  return collections;
};

/**
 * Handle folder reordering within a collection
 * @param collections Current collections array
 * @param collectionId ID of the parent collection
 * @param draggedId ID of dragged folder
 * @param dropId ID of drop target folder
 * @returns Updated collections array with reordered folders
 */
export const reorderFolders = (
  collections: Collection[],
  collectionId: string,
  draggedId: string,
  dropId: string
): Collection[] => {
  if (draggedId === dropId) return collections;

  const collectionsCopy = [...collections];
  const collectionIndex = collectionsCopy.findIndex(c => c.id === collectionId);

  if (collectionIndex !== -1) {
    const foldersCopy = [...collectionsCopy[collectionIndex].folders];
    const draggedIndex = foldersCopy.findIndex(f => f.id === draggedId);
    const dropIndex = foldersCopy.findIndex(f => f.id === dropId);

    if (draggedIndex !== -1 && dropIndex !== -1) {
      // Remove dragged item
      const [removed] = foldersCopy.splice(draggedIndex, 1);
      // Insert at new position
      foldersCopy.splice(dropIndex, 0, removed);

      // Update sort order
      foldersCopy.forEach((folder, index) => {
        folder.sortOrder = index * 100; // Use multiplier to leave space between items
      });

      collectionsCopy[collectionIndex].folders = foldersCopy;
      return collectionsCopy;
    }
  }

  return collections;
};

/**
 * Handle SVG reordering within a folder
 * @param collections Current collections array
 * @param collectionId ID of the parent collection
 * @param folderId ID of the parent folder
 * @param draggedId ID of dragged SVG
 * @param dropId ID of drop target SVG
 * @returns Updated collections array with reordered SVGs
 */
export const reorderSvgs = (
  collections: Collection[],
  collectionId: string,
  folderId: string,
  draggedId: string,
  dropId: string
): Collection[] => {
  if (draggedId === dropId) return collections;

  const collectionsCopy = [...collections];
  const collectionIndex = collectionsCopy.findIndex(c => c.id === collectionId);

  if (collectionIndex !== -1) {
    const folderIndex = collectionsCopy[collectionIndex].folders.findIndex(f => f.id === folderId);

    if (folderIndex !== -1) {
      const itemsCopy = [...collectionsCopy[collectionIndex].folders[folderIndex].items];
      const draggedIndex = itemsCopy.findIndex(item => item.id === draggedId);
      const dropIndex = itemsCopy.findIndex(item => item.id === dropId);

      if (draggedIndex !== -1 && dropIndex !== -1) {
        // Remove dragged item
        const [removed] = itemsCopy.splice(draggedIndex, 1);
        // Insert at new position
        itemsCopy.splice(dropIndex, 0, removed);

        // Update sort order
        itemsCopy.forEach((item, index) => {
          item.sortOrder = index * 100; // Use multiplier to leave space between items
        });

        collectionsCopy[collectionIndex].folders[folderIndex].items = itemsCopy;
        return collectionsCopy;
      }
    }
  }

  return collections;
};

/**
 * Handle drop operation based on dragged and target items
 * @param collections Current collections array
 * @param draggedItem Item being dragged
 * @param dropItem Target drop item
 * @returns Updated collections array with reordered items
 */
export const handleDrop = (
  collections: Collection[],
  draggedItem: DragItem,
  dropItem: DragItem
): Collection[] => {
  if (!draggedItem || !dropItem) return collections;

  // Don't do anything if dragging over itself
  if (draggedItem.id === dropItem.id && draggedItem.type === dropItem.type) {
    return collections;
  }

  // Handle collection reordering
  if (draggedItem.type === 'collection' && dropItem.type === 'collection') {
    return reorderCollections(collections, draggedItem.id, dropItem.id);
  }

  // Handle folder reordering within the same collection
  else if (draggedItem.type === 'folder' && dropItem.type === 'folder') {
    // Make sure we have valid parentIds
    const draggedParentId = draggedItem.parentId || '';
    const dropParentId = dropItem.parentId || '';

    // Only reorder if in the same collection
    if (draggedParentId === dropParentId) {
      return reorderFolders(collections, draggedParentId, draggedItem.id, dropItem.id);
    }
  }

  // Handle SVG reordering within the same folder
  else if (draggedItem.type === 'svg' && dropItem.type === 'svg') {
    // Make sure we have valid parentIds
    const draggedParentId = draggedItem.parentId || '';
    const dropParentId = dropItem.parentId || '';

    // Only reorder if in the same folder
    if (draggedParentId === dropParentId) {
      const collectionId = draggedParentId.split(':')[0];
      const folderId = draggedParentId.split(':')[1];

      if (collectionId && folderId) {
        return reorderSvgs(collections, collectionId, folderId, draggedItem.id, dropItem.id);
      }
    }
  }

  return collections;
};