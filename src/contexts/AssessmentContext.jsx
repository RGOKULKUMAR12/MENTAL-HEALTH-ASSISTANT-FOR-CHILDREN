/**
 * Assessment Context - Stores child assessment results for parent dashboard
 * Persists to localStorage (simulates backend storage for demo)
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'mental-pro-assessments';

const AssessmentContext = createContext(null);

export function AssessmentProvider({ children }) {
  const [assessments, setAssessments] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));
  }, [assessments]);

  const saveAssessment = useCallback((childId, data) => {
    setAssessments((prev) => ({
      ...prev,
      [childId]: { ...data, date: new Date().toISOString().slice(0, 10) },
    }));
  }, []);

  const getAssessment = useCallback((childId) => assessments[childId] || null, [assessments]);
  const getAllAssessments = useCallback(() => assessments, [assessments]);

  const value = { assessments, saveAssessment, getAssessment, getAllAssessments };
  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) throw new Error('useAssessment must be used within AssessmentProvider');
  return context;
}
