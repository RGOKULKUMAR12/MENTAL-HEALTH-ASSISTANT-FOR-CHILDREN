/**
 * RiskBadge - Color-coded indicator for risk levels (non-diagnostic, informational only)
 */

const styles = {
  low: 'bg-risk-low/20 text-risk-low border-risk-low/30',
  moderate: 'bg-risk-moderate/20 text-risk-moderate border-risk-moderate/30',
  high: 'bg-risk-high/20 text-risk-high border-risk-high/30',
};

export default function RiskBadge({ level = 'low' }) {
  const style = styles[level.toLowerCase()] || styles.low;
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${style}`}>
      {label} (informational)
    </span>
  );
}
