'use client';

import React from 'react';

/* ═══════════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════════ */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;        // hex or CSS color
  bgColor?: string;
  trend?: { value: number; label: string };
  subtitle?: string;
}

export function StatCard({ label, value, icon, color = '#6366f1', bgColor, trend, subtitle }: StatCardProps) {
  const bg = bgColor || `${color}18`;
  return (
    <div className="dash-stat-card animate-fade-up">
      {/* Gradient accent glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -mr-8 -mt-8 blur-2xl pointer-events-none"
        style={{ background: color }}
      />
      <div
        className="dash-stat-icon"
        style={{ background: bg, border: `1px solid ${color}30` }}
      >
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div className="dash-stat-value" style={{ color }}>
        {value}
      </div>
      <div className="dash-stat-label">{label}</div>
      {subtitle && (
        <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', marginTop: 6 }}>{subtitle}</p>
      )}
      {trend && (
        <div className="flex items-center gap-1.5 mt-3">
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: trend.value >= 0 ? '#10b981' : '#ef4444',
              background: trend.value >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              padding: '2px 7px',
              borderRadius: 9999,
            }}
          >
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GLASS CARD (generic container)
═══════════════════════════════════════════════════════════ */
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  hover?: boolean;
  accentColor?: string;
}

export function GlassCard({
  children,
  className = '',
  padding = '24px',
  hover = true,
  accentColor,
}: GlassCardProps) {
  return (
    <div
      className={`dash-card ${hover ? 'dash-card-interactive' : ''} ${className}`}
      style={{
        padding,
        ...(accentColor ? { borderTopColor: accentColor, borderTopWidth: 2 } : {}),
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SKELETON LOADER
═══════════════════════════════════════════════════════════ */
interface SkeletonCardProps {
  rows?: number;
  height?: number;
}

export function SkeletonCard({ rows = 3, height = 16 }: SkeletonCardProps) {
  return (
    <div className="dash-card" style={{ padding: 24 }}>
      <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 20 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height, width: i % 3 === 2 ? '60%' : '100%', marginBottom: 10 }} />
      ))}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="dash-stat-card">
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 16 }} />
      <div className="skeleton" style={{ width: '50%', height: 32, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: '70%', height: 12 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════ */
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="dash-empty animate-fade-up">
      <div className="dash-empty-icon">{icon}</div>
      <p className="dash-empty-title">{title}</p>
      {description && <p className="dash-empty-desc">{description}</p>}
      {action && (
        <button className="dash-btn dash-btn-primary" style={{ marginTop: 8 }} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════════════════════════ */
interface ProgressBarProps {
  value: number;      // 0-100
  max?: number;
  color?: 'indigo' | 'green' | 'amber' | 'purple';
  showLabel?: boolean;
  height?: number;
}

export function ProgressBar({ value, max = 100, color = 'indigo', showLabel = true, height = 6 }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="dash-progress-track flex-1" style={{ height }}>
        <div
          className={`dash-progress-fill ${color === 'green' ? 'green' : color === 'amber' ? 'amber' : color === 'purple' ? 'purple' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', minWidth: 36, textAlign: 'right' }}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATUS CHIP
═══════════════════════════════════════════════════════════ */
type ChipVariant = 'success' | 'warning' | 'error' | 'info' | 'purple' | 'neutral';

interface StatusChipProps {
  label: string;
  variant?: ChipVariant;
}

const variantMap: Record<string, ChipVariant> = {
  active: 'success',
  approved: 'success',
  completed: 'success',
  pending: 'warning',
  scheduled: 'info',
  revision_requested: 'warning',
  suspended: 'error',
  cancelled: 'error',
  rejected: 'error',
  ongoing: 'purple',
  upcoming: 'info',
  hold: 'neutral',
};

export function StatusChip({ label, variant }: StatusChipProps) {
  const v = variant || variantMap[label?.toLowerCase()] || 'neutral';
  return <span className={`status-chip chip-${v}`}>{label}</span>;
}

/* ═══════════════════════════════════════════════════════════
   SECTION HEADER
═══════════════════════════════════════════════════════════ */
interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: string;
}

export function SectionHeader({ title, description, action, icon }: SectionHeaderProps) {
  return (
    <div className="dash-section-header">
      <div>
        <div className="flex items-center gap-2.5">
          {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
          <h2 className="dash-section-title">{title}</h2>
        </div>
        {description && <p className="dash-section-desc">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOAST MESSAGES (inline, not floating)
═══════════════════════════════════════════════════════════ */
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose?: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  if (!message) return null;
  return (
    <div className={type === 'success' ? 'dash-toast-success' : 'dash-toast-error'} style={{ marginBottom: 20 }}>
      <span style={{ fontSize: 16 }}>{type === 'success' ? '✓' : '✕'}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ color: 'inherit', opacity: 0.6, fontSize: 16, lineHeight: 1 }}>✕</button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AVATAR
═══════════════════════════════════════════════════════════ */
export function Avatar({ name, size = 'md', color }: { name: string; size?: 'sm' | 'md'; color?: string }) {
  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div
      className={`dash-avatar ${size === 'sm' ? 'dash-avatar-sm' : ''}`}
      style={color ? { background: color } : {}}
    >
      {initials}
    </div>
  );
}
