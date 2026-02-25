/**
 * Questionnaire - Groups as separate cards (Emotional, Behavioral, Cognitive, Social)
 * Click a card to expand and answer questions for that group
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAssessment } from '../contexts/AssessmentContext';
import Card from '../components/ui/Card';
import { MOCK_QUESTIONNAIRE } from '../data/mockData';
import { calculateRisk, RECOMMENDATIONS } from '../utils/riskAssessment';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

const EMOJI_SCALE = ['😢', '😕', '😐', '🙂', '😊'];
const LABELS = ['Not at all', 'A little', 'Somewhat', 'Quite a bit', 'Very much'];

export default function Questionnaire() {
  const { user } = useAuth();
  const { saveAssessment } = useAssessment();
  const navigate = useNavigate();
  const [responses, setResponses] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = MOCK_QUESTIONNAIRE.categories;
  const totalQuestions = categories.reduce((acc, c) => acc + c.questions.length, 0);
  const answeredCount = Object.keys(responses).length;
  const progress = totalQuestions ? (answeredCount / totalQuestions) * 100 : 0;

  const getCategoryAnsweredCount = (cat) => {
    return cat.questions.filter((q) => responses[q.id] != null).length;
  };

  const isCategoryComplete = (cat) => {
    return cat.questions.every((q) => responses[q.id] != null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(responses).length > 0) setSaved(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [responses]);

  const handleResponse = (qId, value) => {
    setResponses((prev) => ({ ...prev, [qId]: value }));
    setSaved(false);
  };

  const handleSubmit = () => {
    const { riskLevel, avgScore } = calculateRisk(responses);
    const rec = RECOMMENDATIONS[riskLevel];
    saveAssessment(user?.id || 'child-1', {
      responses,
      avgScore,
      riskLevel,
      recommendation: rec,
    });
    setSaved(true);
    setSubmitted(true);
    setTimeout(() => navigate('/dashboard/child'), 2000);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="font-display text-2xl font-bold text-primary-600 mb-2">Check-in saved!</h2>
        <p className="text-gray-600 mb-4">Your parent can see your results on their dashboard.</p>
        <p className="text-sm text-gray-500">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <header>
        <h1 className="font-display text-2xl font-bold text-primary-600">How are you feeling? 🌱</h1>
        <p className="text-gray-600 mt-1">Click a card to answer questions—no right or wrong answers!</p>
      </header>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{answeredCount} / {totalQuestions} answered</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Separate cards for each group */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const isExpanded = expandedCard === cat.id;
          const answered = getCategoryAnsweredCount(cat);
          const complete = isCategoryComplete(cat);

          return (
            <Card key={cat.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedCard(isExpanded ? null : cat.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50/50 transition-colors rounded-t-2xl"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <p className="font-bold text-gray-800">{cat.name}</p>
                    <p className="text-sm text-gray-500">
                      {answered}/{cat.questions.length} answered
                      {complete && <span className="text-risk-low ml-2">✓ Done</span>}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-6 pt-2 border-t border-gray-100 space-y-6">
                  {cat.questions.map((q) => (
                    <div key={q.id} className="pt-4">
                      <p className="font-medium text-gray-800 mb-3">{q.text}</p>
                      <div className="flex flex-wrap gap-3">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleResponse(q.id, val)}
                            className={`
                              flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all
                              ${responses[q.id] === val
                                ? 'border-primary-500 bg-primary-50 text-primary-600'
                                : 'border-gray-200 hover:border-primary-300 bg-white'
                              }
                            `}
                          >
                            <span className="text-2xl">{EMOJI_SCALE[val - 1]}</span>
                            <span className="text-xs text-gray-500">{LABELS[val - 1]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">{saved ? '✓ Saved' : ''}</p>
        <button
          onClick={handleSubmit}
          disabled={answeredCount < totalQuestions}
          className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save check-in
        </button>
      </div>
    </div>
  );
}
