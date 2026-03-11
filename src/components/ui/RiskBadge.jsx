/**
 * RiskBadge - Color-coded indicator for risk levels (non-diagnostic, informational only)
 */

const styles = {
  low: 'bg-risk-low/20 text-risk-low border-risk-low/30',
  moderate: 'bg-risk-moderate/20 text-risk-moderate border-risk-moderate/30',
  high: 'bg-risk-high/20 text-risk-high border-risk-high/30',
};

const sizeStyles = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base font-semibold',
};

export default function RiskBadge({ level = 'low', size = 'md' }) {
  const style = styles[level.toLowerCase()] || styles.low;
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  const sizeStyle = sizeStyles[size] || sizeStyles.md;
  
  return (
    <span className={`inline-flex items-center rounded-full border ${style} ${sizeStyle}`}>
      {label} (informational)
    </span>
  );
}
