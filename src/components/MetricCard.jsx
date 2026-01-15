import React from "react";
import {
  Activity,
  UserPlus,
  MousePointerClick,
  Users as UsersIcon,
  Clock3,
} from "lucide-react";
const TEAL = "#23B5B5";

const MetricCard = ({
  title,
  subtitle,
  value,
  variant = "default",
  compact = false,
  icon,
}) => {
  const formattedValue =
    typeof value === "number" ? value.toLocaleString() : value;

  const isPrimary = variant === "primary";

  const iconMap = {
    pulse: <Activity className="w-4 h-4" />,
    userPlus: <UserPlus className="w-4 h-4" />,
    click: <MousePointerClick className="w-4 h-4" />,
    users: <UsersIcon className="w-4 h-4" />,
    activity: <Activity className="w-4 h-4" />,
    clock: <Clock3 className="w-4 h-4" />,
  };

  return (
    <div
      className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-4 border transition-all duration-150 ${
        isPrimary
          ? "bg-teal-500/10 border-teal-500/40 shadow-sm"
          : "bg-slate-900 border-slate-800 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {title}
          </p>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div
            className={`flex items-center justify-center rounded-full ${
              compact ? "w-7 h-7" : "w-8 h-8"
            }`}
            style={{
              background: isPrimary
                ? "rgba(35,181,181,0.18)"
                : "rgba(15,23,42,0.7)",
              color: isPrimary ? TEAL : "#e5f9f9",
            }}
          >
            {iconMap[icon]}
          </div>
        )}
      </div>
      <p
        className={`mt-2 ${
          compact ? "text-xl" : "text-2xl"
        } sm:text-2xl font-semibold text-slate-50`}
      >
        {formattedValue}
      </p>
    </div>
  );
};

export default MetricCard;
