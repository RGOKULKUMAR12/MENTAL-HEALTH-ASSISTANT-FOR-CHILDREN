/*
 * Questionnaire - Section-based single-question UX
 * Card selection for each section + page navigation (+ reports + parent accessible data)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAssessment } from '../contexts/AssessmentContext';
import { MOCK_QUESTIONNAIRE } from '../data/mockData';
import { calculateRisk } from '../utils/riskAssessment';
import { identifyConditions, generateParentReport } from '../utils/mentalIllnessIdentification';
import { ChevronLeft, ChevronRight, Check, ArrowRight, Heart, Star, Sparkles } from 'lucide-react';

const EMOJI_SCALE = ['😢', '😕', '😐', '🙂', '😊'];
const LABELS = ['Not at all', 'A little', 'Somewhat', 'Quite a bit', 'Very much'];

export default function Questionnaire() {
  const { user } = useAuth();
  const { saveAssessment } = useAssessment();
  const navigate = useNavigate();

  const [stage, setStage] = useState('selection');
  const [activeSection, setActiveSection] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [completedSections, setCompletedSections] = useState(new Set());
  const [sectionProgress, setSectionProgress] = useState({}); // Track progress per section
  const [answerTime, setAnswerTime] = useState(null); // Track when question was answered

  const categories = MOCK_QUESTIONNAIRE.categories;
  const allQuestions = categories.flatMap((cat) => cat.questions);

  const currentSection = activeSection !== null ? categories[activeSection] : null;
  const currentQuestion = currentSection ? currentSection.questions[currentQuestionIndex] : null;

  const answeredCount = Object.keys(responses).length;
  const totalQuestions = allQuestions.length;
  const progress = totalQuestions ? (answeredCount / totalQuestions) * 100 : 0;

  // Timer for waiting 5 seconds after answer
  const [_, setTimerUpdate] = useState(0);
  useEffect(() => {
    if (!answerTime) return;
    const interval = setInterval(() => {
      setTimerUpdate((prev) => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, [answerTime]);

  const isSectionComplete = (sectionIndex) => {
    const section = categories[sectionIndex];
    return section.questions.every((q) => responses[q.id] != null);
  };

  const handleSelectSection = (index) => {
    setActiveSection(index);
    setCurrentQuestionIndex(sectionProgress[index] || 0);
    setStage('questions');
  };

  const goNextQuestion = () => {
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswerTime(null); // Reset timer for new question
    }
  };

  const goPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAnswerTime(null); // Reset timer for new question
    }
  };

  const handleResponse = (qId, value) => {
    setResponses((prev) => ({ ...prev, [qId]: value }));
    setAnswerTime(Date.now()); // Record answer time
    setSectionProgress((prev) => ({ ...prev, [activeSection]: currentQuestionIndex }));

    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setSectionProgress((prev) => ({ ...prev, [activeSection]: nextIndex }));
      }, 300);
    } else {
      setCompletedSections((prev) => new Set(prev).add(activeSection));
    }
  };

  const handleSectionBack = () => {
    setActiveSection(null);
    setStage('selection');
    setCurrentQuestionIndex(0);
  };

  const handleFinalSubmit = () => {
    if (answeredCount !== totalQuestions) {
      alert('Please answer all questions before submitting.');
      return;
    }

    const { avgScore, riskLevel } = calculateRisk(responses);
    const parentReport = generateParentReport(responses, allQuestions, riskLevel, avgScore);

    saveAssessment(user?.id || 'child-1', {
      responses,
      avgScore,
      riskLevel,
      conditions: parentReport.identifiedConditions,
      report: parentReport,
      date: new Date().toISOString().slice(0, 10),
    });

    // Children don't see results - redirect directly to dashboard
    navigate('/dashboard/child');
  };

  if (stage === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Wellness Check-in
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Let's take a moment to check how you're feeling. Answer questions in each area to help us understand your wellness better.
            </p>
          </div>

          {/* Progress Overview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Your Progress
              </h2>
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {answeredCount} of {totalQuestions} questions
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress === 100 && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">All questions completed!</span>
                </div>
              </div>
            )}
          </div>

          {/* Section Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat, index) => {
              const complete = isSectionComplete(index);
              const answered = cat.questions.filter((q) => responses[q.id] != null).length;
              const sectionProgressPercent = (answered / cat.questions.length) * 100;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectSection(index)}
                  className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl hover:scale-105 transition-all duration-300 text-left"
                >
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                          <span className="text-2xl">{cat.icon}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {cat.name}
                          </h3>
                          <p className="text-sm text-gray-500">{cat.questions.length} questions</p>
                        </div>
                      </div>
                      {complete && (
                        <div className="p-2 bg-green-100 rounded-full">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{answered}/{cat.questions.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${sectionProgressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Status message */}
                    <div className="text-sm text-gray-600">
                      {complete ? (
                        <span className="text-green-600 font-medium">✓ Completed</span>
                      ) : answered > 0 ? (
                        <span className="text-blue-600">Continue where you left off</span>
                      ) : (
                        <span>Ready to start</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          {answeredCount === totalQuestions && (
            <div className="mt-8 text-center">
              <button
                onClick={handleFinalSubmit}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Star className="w-5 h-5" />
                Complete Check-in
                <Star className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'questions' && currentSection && currentQuestion) {
    const sectionAnswered = currentSection.questions.filter((q) => responses[q.id] != null).length;
    const isLastQuestion = currentQuestionIndex === currentSection.questions.length - 1;
    const sectionProgressPercent = (sectionAnswered / currentSection.questions.length) * 100;
    
    // Check if 5 seconds have passed since answer
    const canProceedToNext = !responses[currentQuestion.id] || 
      (answerTime && Date.now() - answerTime >= 5000);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Overall Progress - TOP */}
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Overall Progress
              </h3>
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {answeredCount} of {totalQuestions} questions
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <button
              onClick={handleSectionBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to sections
            </button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <span className="text-xl">{currentSection.icon}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{currentSection.name}</h1>
                  <p className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {currentSection.questions.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 mb-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 leading-relaxed">
                {currentQuestion.text}
              </h2>
              <p className="text-sm text-gray-500">Choose how you feel about this</p>
            </div>

            {/* Emoji Response Options */}
            <div className="grid grid-cols-5 gap-4 mb-8">
              {EMOJI_SCALE.map((emoji, idx) => {
                const value = idx + 1;
                const selected = responses[currentQuestion.id] === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleResponse(currentQuestion.id, value)}
                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      selected
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform duration-300">
                        {emoji}
                      </span>
                      <span className={`text-sm font-medium ${selected ? 'text-white' : 'text-gray-600'}`}>
                        {LABELS[idx]}
                      </span>
                    </div>
                    {selected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Waiting Timer */}
            {responses[currentQuestion.id] && !canProceedToNext && (
              <div className="text-center mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">
                  ⏱️ Take your time to think... Waiting {Math.ceil((5000 - (Date.now() - answerTime)) / 1000)} seconds
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600"></div>

              <div className="flex gap-3">
                <button
                  onClick={goPrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 inline mr-1" />
                  Previous
                </button>

                {!isLastQuestion ? (
                  <button
                    onClick={goNextQuestion}
                    disabled={!canProceedToNext}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 inline ml-1" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setCompletedSections((prev) => new Set(prev).add(activeSection));
                      handleSectionBack();
                    }}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium hover:shadow-lg transition-all duration-300"
                  >
                    <Check className="w-4 h-4 inline mr-1" />
                    Finish Section
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section Progress - BOTTOM */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Section Progress</h3>
              <span className="text-sm font-medium text-gray-600">
                {sectionAnswered} of {currentSection.questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${sectionProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
