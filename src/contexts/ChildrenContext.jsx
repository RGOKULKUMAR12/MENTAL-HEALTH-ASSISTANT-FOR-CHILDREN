/**
 * Children Context - Parent-created child accounts
 * Stores child users (username, password, name) linked to parent
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'mental-pro-children';

const ChildrenContext = createContext(null);

export function ChildrenProvider({ children: childContent }) {
  const [childrenList, setChildrenList] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(childrenList));
  }, [childrenList]);

  const createChild = useCallback((parentId, name, username, password) => {
    const id = `child-${Date.now()}`;
    const newChild = {
      id,
      parentId,
      name,
      username: username.trim().toLowerCase(),
      password, // In production: hash before storing
      consentStatus: 'approved',
    };
    setChildrenList((prev) => [...prev, newChild]);
    return newChild;
  }, []);

  const getChildrenByParent = useCallback(
    (parentId) => childrenList.filter((c) => c.parentId === parentId),
    [childrenList],
  );

  const findChildByCredentials = useCallback(
    (username, password) =>
      childrenList.find(
        (c) => c.username === username.trim().toLowerCase() && c.password === password,
      ),
    [childrenList],
  );

  const deleteChild = useCallback((parentId, childId) => {
    setChildrenList((prev) => prev.filter((c) => !(c.parentId === parentId && c.id === childId)));
  }, []);

  const value = {
    childrenList,
    createChild,
    getChildrenByParent,
    findChildByCredentials,
    deleteChild,
  };
  return (
    <ChildrenContext.Provider value={value}>
      {childContent}
    </ChildrenContext.Provider>
  );
}

export function useChildren() {
  const context = useContext(ChildrenContext);
  if (!context) throw new Error('useChildren must be used within ChildrenProvider');
  return context;
}
