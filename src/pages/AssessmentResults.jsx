/**
 * Assessment Results Page with Mental Illness Identification
 * Shows identified conditions, symptoms, tips, and appointment booking
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Heart, Lightbulb, Pill, Calendar, TrendingUp } from 'lucide-react';
import AppointmentBookingModal from '../components/AppointmentBookingModal';

export default function AssessmentResults({ assessment, parentId, childId, childName }) {
  const navigate = useNavigate();
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading results...</p>
      </div>
    );
  }

  const { riskLevel, avgScore, report } = assessment;
  const { identifiedConditions, overallTips, nextSteps } = report;

  const riskColors = {
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '✅' },
    moderate: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: '⚠️' },
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '🚨' },
  };

  const colors = riskColors[riskLevel];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <header className="text-center space-y-3 mb-8">
        <h1 className="font-display text-3xl font-bold text-primary-600">Your Assessment Results</h1>
        <p className="text-gray-600">Here's what your check-in reveals about your well-being</p>
      </header>

      {/* Overall Risk Level */}
      <div className={`${colors.bg} border-2 ${colors.border} rounded-lg p-6 space-y-3`}>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{colors.icon}</span>
          <div className="flex-1">
            <h2 className={`font-display text-2xl font-bold ${colors.text} mb-2`}>
              {riskLevel === 'low' && "You're doing great!"}
              {riskLevel === 'moderate' && 'Room for improvement'}
              {riskLevel === 'high' && 'Professional support recommended'}
            </h2>
            <p className={`${colors.text}`}>{report.summary}</p>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="text-center">
            <p className="text-sm text-gray-600">Average Score</p>
            <p className="text-2xl font-bold text-primary-600">{avgScore}/5</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Risk Level</p>
            <p className={`text-2xl font-bold capitalize ${colors.text}`}>{riskLevel}</p>
          </div>
        </div>
      </div>

      {/* Identified Conditions */}
      {identifiedConditions.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-gray-800">What We've Identified</h2>
          <p className="text-gray-600">
            Based on your responses, we've identified the following areas that might need support:
          </p>

          <div className="grid grid-cols-1 gap-4">
            {identifiedConditions.map((item, index) => {
              const condition = item.condition;
              return (
                <div key={index} className="border-l-4 border-primary-500 pl-4 py-4 bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{condition.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">{condition.shortName}</h3>
                      <p className="text-sm text-gray-600">{condition.description}</p>
                      <div className="mt-2 inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full capitalize">
                        {item.confidence} confidence
                      </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div className="space-y-2">
                    <p className="font-medium text-sm text-gray-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Common Signs
                    </p>
                    <ul className="space-y-1 ml-6">
                      {condition.symptoms.map((symptom, idx) => (
                        <li key={idx} className="text-sm text-gray-600">• {symptom}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Tips */}
                  <div className="space-y-2">
                    <p className="font-medium text-sm text-gray-700 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Helpful Strategies
                    </p>
                    <ul className="space-y-1 ml-6">
                      {condition.tips.slice(0, 4).map((tip, idx) => (
                        <li key={idx} className="text-sm text-gray-600">• {tip}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Professional Help Note */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-700">
                      <Pill className="w-4 h-4 inline mr-2" />
                      {condition.professionalHelp}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* General Tips */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-gray-800">General Wellness Tips</h2>
        <div className="grid grid-cols-1 gap-3">
          {overallTips.map((tip, index) => (
            <div key={index} className="flex gap-3 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <span className="text-2xl">💡</span>
              <p className="text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className={`${colors.bg} border-2 ${colors.border} rounded-lg p-6 space-y-4`}>
        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Next Steps
        </h3>
        <p className={`${colors.text}`}>{nextSteps}</p>

        {riskLevel === 'high' && (
          <button
            onClick={() => setShowAppointmentModal(true)}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105"
          >
            <Calendar className="w-5 h-5" />
            Book an Appointment with a Professional
          </button>
        )}

        {riskLevel !== 'high' && (
          <button
            onClick={() => setShowAppointmentModal(true)}
            className="w-full bg-primary-100 hover:bg-primary-200 text-primary-700 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Calendar className="w-5 h-5" />
            Optional: Book a Consultation
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => navigate('/dashboard/child')}
          className="px-6 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-primary-600 text-white hover:bg-primary-700 rounded-lg font-medium transition-all"
        >
          Print Results
        </button>
      </div>

      {/* Appointment Modal */}
      <AppointmentBookingModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        parentId={parentId}
        childId={childId}
        childName={childName}
      />
    </div>
  );
}
