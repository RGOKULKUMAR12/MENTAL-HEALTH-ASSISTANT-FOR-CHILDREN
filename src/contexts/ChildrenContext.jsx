/**
 * Children Context - Parent-created child accounts
 * Fetches and mutates child users from backend
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api/api';
import { useAuth } from './AuthContext';

const ChildrenContext = createContext(null);

export function ChildrenProvider({ children: childContent }) {
  const { user, isAuthenticated } = useAuth();
  const [childrenList, setChildrenList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resolveParentId = useCallback(
    (parentId) => {
      if (parentId != null) return parentId;
      if (!user) return null;
      if (user.role === 'parent') return user.id;
      if (user.role === 'child') return user.parentId;
      return null;
    },
    [user],
  );

  const refreshChildren = useCallback(async (parentId) => {
    const effectiveParentId = resolveParentId(parentId);
    if (!isAuthenticated || effectiveParentId == null) {
      setChildrenList([]);
      return [];
    }

    setLoading(true);
    setError('');
    try {
      const data = await api.getChildren(effectiveParentId);
      const items = data?.items || [];
      setChildrenList(items);
      return items;
    } catch (err) {
      setError(err?.message || 'Failed to load children');
      setChildrenList([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, resolveParentId]);

  useEffect(() => {
    refreshChildren().catch(() => {});
  }, [refreshChildren]);

  const createChild = useCallback(async (parentId, name, username, password) => {
    const effectiveParentId = resolveParentId(parentId);
    const data = await api.createChild(effectiveParentId, {
      name,
      username,
      password,
    });
    const created = data?.child;
    if (created) {
      setChildrenList((prev) => [created, ...prev]);
    }
    return created;
  }, [resolveParentId]);

  const getChildrenByParent = useCallback(
    (parentId) => {
      if (parentId == null) return [];
      return childrenList.filter((c) => String(c.parentId) === String(parentId));
    },
    [childrenList],
  );

  const deleteChild = useCallback(async (parentId, childId) => {
    const effectiveParentId = resolveParentId(parentId);
    await api.deleteChild(effectiveParentId, childId);
    setChildrenList((prev) => prev.filter((c) => String(c.id) !== String(childId)));
  }, [resolveParentId]);

  const value = {
    childrenList,
    loading,
    error,
    refreshChildren,
    createChild,
    getChildrenByParent,
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
