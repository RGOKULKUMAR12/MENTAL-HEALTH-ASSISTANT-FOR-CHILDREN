/**
 * Wellness Activities - card-based, completion tracked, streak only when all core wellness completed.
 * Core wellness cards:
 * - Breathing exercise
 * - 5-4-3-2-1 grounding
 * - Daily reminders checklist
 *
 * Streak increases only if all three are completed for the day.
 * Music card is available but optional (does not gate streak).
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import { recordDailyVisit, getStreak } from '../utils/streakUtils';
import { Wind, Heart, Sparkles, Flame, Music, CheckSquare } from 'lucide-react';

const GROUNDING_STEPS = [
  'Notice 5 things you can see around you.',
  'Listen for 4 sounds nearby.',
  'Feel 3 things you can touch.',
  'Smell 2 things in the air.',
  'Notice 1 thing you taste or can imagine tasting.',
];

const REMINDERS = [
  'Get some fresh air today',
  'Do something kind for someone',
  'Notice one thing you are grateful for',
  'Take a short break when you need it',
];

export default function Wellness() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [activeCard, setActiveCard] = useState(null); // 'breathing' | 'grounding' | 'reminders' | 'music'

  // Breathing state
  const [breathPhase, setBreathPhase] = useState('in');
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

  // Checklists
  const [groundingChecks, setGroundingChecks] = useState(Array(GROUNDING_STEPS.length).fill(false));
  const [reminderChecks, setReminderChecks] = useState(Array(REMINDERS.length).fill(false));

  // Completion and hint
  const [completed, setCompleted] = useState({
    breathing: false,
    grounding: false,
    reminders: false,
  });
  const [showHint, setShowHint] = useState(false);

  // Load today's streak (streak only increases when all three complete)
  useEffect(() => {
    setStreak(getStreak(user?.id));
  }, [user?.id]);

  // Breathing timer – runs only when isRunning is true
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 0) {
          clearInterval(timer);
          setIsRunning(false);
          markComplete('breathing');
          return 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  // Breathing phase animation – only while running
  useEffect(() => {
    if (!isRunning) return;
    const phaseTimer = setInterval(() => {
      setBreathPhase((p) => (p === 'in' ? 'hold' : p === 'hold' ? 'out' : 'in'));
    }, 4000);
    return () => clearInterval(phaseTimer);
  }, [isRunning]);

  const markComplete = (key) => {
    setCompleted((prev) => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: true };
      const allDone = next.breathing && next.grounding && next.reminders;
      if (allDone) {
        const { streak: s } = recordDailyVisit(user?.id);
        setStreak(s);
        setShowHint(false);
      } else {
        setShowHint(true);
      }
      return next;
    });
  };

  const toggleGrounding = (index) => {
    setGroundingChecks((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      if (next.every(Boolean)) {
        markComplete('grounding');
      }
      return next;
    });
  };

  const toggleReminder = (index) => {
    setReminderChecks((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      if (next.every(Boolean)) {
        markComplete('reminders');
      }
      return next;
    });
  };

  const startBreathing = () => {
    setSeconds(60);
    setBreathPhase('in');
    setIsRunning(true);
  };

  const allCompleted = completed.breathing && completed.grounding && completed.reminders;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header>
        <h1 className="font-display text-2xl font-bold text-primary-600">Wellness activities 🌿</h1>
        <p className="text-gray-600 mt-1">
          These are for relaxation only—not medical advice.
        </p>
      </header>

      {/* Streak score - only after all core wellness done */}
      <Card className="bg-primary-50 border-2 border-primary-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center">
            <Flame className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">
              {streak} day{streak !== 1 ? 's' : ''} streak
            </p>
            <p className="text-sm text-gray-600">
              Complete all wellness cards each day to grow your streak.
            </p>
          </div>
        </div>
      </Card>

      {showHint && !allCompleted && (
        <Card className="bg-yellow-50 border border-yellow-200">
          <p className="text-sm text-gray-800">
            Great job starting your wellness! Complete all cards today to earn your streak.
          </p>
        </Card>
      )}

      {/* Breathing card */}
      <Card>
        <button
          onClick={() => setActiveCard(activeCard === 'breathing' ? null : 'breathing')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-t-2xl"
        >
          <div className="flex items-center gap-3">
            <Wind className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-semibold text-gray-800">Balloon breath</p>
              <p className="text-xs text-gray-500">
                {completed.breathing ? 'Completed for today' : 'Start timer to complete this card'}
              </p>
            </div>
          </div>
          <CheckSquare
            className={`w-5 h-5 ${completed.breathing ? 'text-risk-low' : 'text-gray-300'}`}
          />
        </button>
        {activeCard === 'breathing' && (
          <div className="px-4 pb-6 pt-2 border-t border-gray-100 flex flex-col items-center gap-6">
            <p className="text-sm text-gray-600 text-center">
              Breathe in slowly like filling a balloon, hold briefly, then breathe out slowly.
            </p>
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl transition-all duration-2000 ${
                isRunning
                  ? breathPhase === 'in'
                    ? 'bg-primary-200 scale-125'
                    : breathPhase === 'out'
                    ? 'bg-primary-100 scale-90'
                    : 'bg-primary-100 scale-110'
                  : 'bg-primary-100'
              }`}
            >
              {isRunning
                ? breathPhase === 'in'
                  ? '🌬️'
                  : breathPhase === 'hold'
                  ? '⏸️'
                  : '💨'
                : '🌬️'}
            </div>
            <p className="font-medium text-gray-700">
              {isRunning
                ? breathPhase === 'in'
                  ? 'Breathe in...'
                  : breathPhase === 'hold'
                  ? 'Hold...'
                  : 'Breathe out...'
                : 'Press start to begin'}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (isRunning) {
                    setIsRunning(false);
                    setSeconds(60);
                  } else {
                    startBreathing();
                  }
                }}
                className="px-6 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600"
              >
                {isRunning ? 'Stop' : 'Start'} timer
              </button>
              <span className="text-lg font-mono">
                {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* 5-4-3-2-1 grounding card */}
      <Card>
        <button
          onClick={() => setActiveCard(activeCard === 'grounding' ? null : 'grounding')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-t-2xl"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-semibold text-gray-800">5-4-3-2-1 grounding</p>
              <p className="text-xs text-gray-500">
                {completed.grounding ? 'Completed for today' : 'Check off each step as you go'}
              </p>
            </div>
          </div>
          <CheckSquare
            className={`w-5 h-5 ${completed.grounding ? 'text-risk-low' : 'text-gray-300'}`}
          />
        </button>
        {activeCard === 'grounding' && (
          <div className="px-4 pb-6 pt-2 border-t border-gray-100 space-y-3">
            {GROUNDING_STEPS.map((step, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={groundingChecks[idx]}
                  onChange={() => toggleGrounding(idx)}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span
                  className={
                    groundingChecks[idx]
                      ? 'text-gray-400 line-through'
                      : 'text-gray-700'
                  }
                >
                  {step}
                </span>
              </label>
            ))}
          </div>
        )}
      </Card>

      {/* Daily reminders card */}
      <Card>
        <button
          onClick={() => setActiveCard(activeCard === 'reminders' ? null : 'reminders')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-t-2xl"
        >
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-semibold text-gray-800">Daily reminders</p>
              <p className="text-xs text-gray-500">
                {completed.reminders ? 'Completed for today' : 'Little habits that can help you feel better'}
              </p>
            </div>
          </div>
          <CheckSquare
            className={`w-5 h-5 ${completed.reminders ? 'text-risk-low' : 'text-gray-300'}`}
          />
        </button>
        {activeCard === 'reminders' && (
          <div className="px-4 pb-6 pt-2 border-t border-gray-100 space-y-3">
            {REMINDERS.map((reminder, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderChecks[idx]}
                  onChange={() => toggleReminder(idx)}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span
                  className={
                    reminderChecks[idx]
                      ? 'text-gray-400 line-through'
                      : 'text-gray-700'
                  }
                >
                  {reminder}
                </span>
              </label>
            ))}
          </div>
        )}
      </Card>

      {/* Calming music card (optional, does not gate streak) */}
      <Card>
        <button
          onClick={() => setActiveCard(activeCard === 'music' ? null : 'music')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-t-2xl"
        >
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-semibold text-gray-800">Calming music</p>
              <p className="text-xs text-gray-500">
                Listen to soft sounds to help you relax.
              </p>
            </div>
          </div>
        </button>
        {activeCard === 'music' && (
          <div className="px-4 pb-6 pt-2 border-t border-gray-100 space-y-4">
            <p className="text-sm text-gray-600">
              Choose a track and listen quietly for a few minutes. Audio here is a sample; in a full
              system, your school or parents can choose preferred music.
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Soft piano</p>
                <audio controls className="mt-1 w-full">
                  <source src="" type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Nature sounds</p>
                <audio controls className="mt-1 w-full">
                  <source src="" type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
