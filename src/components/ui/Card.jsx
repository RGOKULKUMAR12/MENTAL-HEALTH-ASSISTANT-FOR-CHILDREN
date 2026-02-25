/**
 * Card - Reusable container component for dashboards and content blocks
 */

export default function Card({ children, className = '', padding = true }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
    </div>
  );
}
