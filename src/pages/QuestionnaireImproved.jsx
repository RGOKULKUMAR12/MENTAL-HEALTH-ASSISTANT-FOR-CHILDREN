/**
 * Improved Questionnaire with Section-based Pagination
 * Shows 4 sections as cards, click to see one question at a time
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAssessment } from '../contexts/AssessmentContext';
import { MOCK_QUESTIONNAIRE } from '../data/mockData';
import { calculateRisk } from '../utils/riskAssessment';
import { identifyConditions, generateParentReport } from '../utils/mentalIllnessIdentification';
import { ChevronLeft, ChevronRight, Check, ArrowRight } from 'lucide-react';

const EMOJI_SCALE = ['😢', '😕', '😐', '🙂', '😊'];
const LABELS = ['Not at all', 'A little', 'Somewhat', 'Quite a bit', 'Very much'];

export default function QuestionnaireImproved() {
  const { user } = useAuth();
  const { saveAssessment } = useAssessment();
  const navigate = useNavigate();

  const [stage, setStage] = useState('selection'); // 'selection' | 'questions' | 'results'
  const [activeSection, setActiveSection] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [completedSections, setCompletedSections] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);

  const categories = MOCK_QUESTIONNAIRE.categories;
  const allQuestions = categories.flatMap((cat) => cat.questions);

  // Get current section data
  const currentSection = activeSection !== null ? categories[activeSection] : null;
  const currentQuestion = currentSection ? currentSection.questions[currentQuestionIndex] : null;

  // Calculate progress
  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(responses).length;
  const progress = (answeredCount / totalQuestions) * 100;

  // Check if section is complete
  const isSectionComplete = (sectionIndex) => {
    const section = categories[sectionIndex];
    return section.questions.every((q) => responses[q.id] != null);
  };

  // Handle response and auto-advance
  const handleResponse = (qId, value) => {
    setResponses((prev) => ({ ...prev, [qId]: value }));

    // Auto-advance to next question
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    } else {
      // Mark section as complete
      setCompletedSections((prev) => new Set([...prev, activeSection]));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleExitSection = () => {
    setActiveSection(null);
    setCurrentQuestionIndex(0);
  };

  const handleSubmit = () => {
    if (answeredCount !== totalQuestions) {
      alert('Please answer all questions before submitting');
      return;
    }

    const { riskLevel, avgScore } = calculateRisk(responses);
    const parentReport = generateParentReport(responses, allQuestions, riskLevel, avgScore);

    saveAssessment(user?.id || 'child-1', {
      responses,
      avgScore,
      riskLevel,
      conditions: parentReport.identifiedConditions,
      report: parentReport,
    });

    setSubmitted(true);
    setTimeout(() => {
      navigate('/dashboard/child');
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="font-display text-2xl font-bold text-primary-600 mb-2">Check-in saved!</h2>
        <p className="text-gray-600 mb-4">Your parent can view your detailed results and recommendations.</p>
        <p className="text-sm text-gray-500">Redirecting...</p>
      </div>
    );
  }

  // SECTION SELECTION STAGE
  if (stage === 'selection' && activeSection === null) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <header>
          <h1 className="font-display text-3xl font-bold text-primary-600 mb-2">How are you feeling? 🌱</h1>
          <p className="text-gray-600">Let's check in on 4 areas of your life. Each takes about 2 minutes.</p>
        </header>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-primary-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary-400 to-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{answeredCount} of {totalQuestions} questions answered</p>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category, index) => {
            const categoryComplete = isSectionComplete(index);
            const categoryAnswered = category.questions.filter((q) => responses[q.id] != null).length;

            return (
              <button
                key={category.id}
                onClick={() => {
                  setActiveSection(index);
                  setCurrentQuestionIndex(0);
                }}
                className="relative group p-6 rounded-lg border-2 border-gray-200 hover:border-primary-400 bg-white hover:bg-primary-50 transition-all cursor-pointer text-left"
              >
                {categoryComplete && (
                  <div className="absolute top-3 right-3 bg-green-100 rounded-full p-2">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                )}

                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-display text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{category.questions.length} questions</p>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${(categoryAnswered / category.questions.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {categoryAnswered}/{category.questions.length} answered
                </p>

                <div className="mt-4 flex items-center text-primary-600 group-hover:translate-x-1 transition-transform">
                  <span className="font-medium">
                    {categoryComplete ? 'Review' : 'Start'}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        {answeredCount === totalQuestions && (
          <div className="flex justify-center">
            <button
              onClick={() => {
                setStage('results');
                handleSubmit();
              }}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all"
            >
              View Your Results ✨
            </button>
          </div>
        )}
      </div>
    );
  }

  // QUESTION STAGE
  if (activeSection !== null && currentQuestion) {
    const sectionComplete = isSectionComplete(activeSection);
    const isLastQuestion = currentQuestionIndex === currentSection.questions.length - 1;

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <header className="space-y-3">
          <button
            onClick={handleExitSection}
            className="text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to sections
          </button>

          <div>
            <h2 className="font-display text-2xl font-bold text-primary-600 mb-1">
              {currentSection.name} {currentSection.icon}
            </h2>
            <p className="text-gray-600">
              Question {currentQuestionIndex + 1} of {currentSection.questions.length}
            </p>
          </div>

          {/* Section Progress */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / currentSection.questions.length) * 100}%` }}
            />
          </div>
        </header>

        {/* Question Card */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">{currentQuestion.text}</h3>

          {/* Emoji Scale Response */}
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-2">
              {EMOJI_SCALE.map((emoji, index) => {
                const value = index + 1;
                const isSelected = responses[currentQuestion.id] === value;

                return (
                  <button
                    key={value}
                    onClick={() => handleResponse(currentQuestion.id, value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all transform hover:scale-110 ${
                      isSelected
                        ? 'bg-primary-100 scale-110 ring-2 ring-primary-500'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-3xl">{emoji}</span>
                    <span className="text-xs text-gray-600 hidden sm:block">{LABELS[index]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {!isLastQuestion ? (
            <button
              onClick={handleNextQuestion}
              disabled={responses[currentQuestion.id] == null}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleExitSection}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all"
            >
              <Check className="w-4 h-4" />
              Section Complete
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
