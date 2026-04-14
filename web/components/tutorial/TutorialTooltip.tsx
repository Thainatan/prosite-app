'use client';
import { ArrowLeft, ArrowRight, X, Check } from 'lucide-react';
import { TutorialStep } from '../../lib/tutorials';

interface Props {
  step: TutorialStep;
  stepIndex: number;
  totalSteps: number;
  top: number;
  left: number;
  arrowSide: string;
  isCenter: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: (href?: string) => void;
}

export default function TutorialTooltip({
  step, stepIndex, totalSteps, top, left, arrowSide, isCenter,
  onNext, onPrev, onSkip, onComplete,
}: Props) {
  const progress = ((stepIndex + 1) / totalSteps) * 100;
  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;
  const hasCustomButtons = !!(step.primaryBtn || step.secondaryBtn);

  const handlePrimary = () => {
    if (!step.primaryBtn) return;
    const { action, href } = step.primaryBtn;
    if (action === 'next') onNext();
    else if (action === 'complete') {
      onComplete();
      if (href) window.location.href = href;
    }
  };

  const handleSecondary = () => {
    if (!step.secondaryBtn) return;
    const { action, href } = step.secondaryBtn;
    if (action === 'skip') onSkip();
    else if (action === 'next') {
      onNext();
      if (href) window.location.href = href;
    } else if (action === 'complete') {
      onComplete();
      if (href) window.location.href = href;
    }
  };

  const arrowStyle: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      position: 'absolute', width: 0, height: 0, pointerEvents: 'none',
    };
    switch (arrowSide) {
      case 'left':
        return { ...base, left: -9, top: '50%', transform: 'translateY(-50%)', borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderRight: '9px solid white' };
      case 'right':
        return { ...base, right: -9, top: '50%', transform: 'translateY(-50%)', borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '9px solid white' };
      case 'top':
        return { ...base, top: -9, left: '50%', transform: 'translateX(-50%)', borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderBottom: '9px solid white' };
      case 'bottom':
        return { ...base, bottom: -9, left: '50%', transform: 'translateX(-50%)', borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderTop: '9px solid white' };
      default:
        return { display: 'none' };
    }
  })();

  return (
    <div style={{
      position: 'fixed',
      top: isCenter ? '50%' : top,
      left: isCenter ? '50%' : left,
      transform: isCenter ? 'translate(-50%,-50%)' : undefined,
      width: 320,
      background: 'white',
      borderRadius: 14,
      boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 4px 20px rgba(0,0,0,0.2)',
      borderTop: '3px solid #E8834A',
      overflow: 'visible',
      animation: 'tutorialFadeIn 0.2s ease-out',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      zIndex: 99999,
    }}>
      {/* Arrow */}
      {!isCenter && <div style={arrowStyle} />}

      {/* Header */}
      <div style={{ padding: '14px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, paddingRight: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#E8834A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            Step {stepIndex + 1} of {totalSteps}
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1C2B3A', lineHeight: 1.3 }}>
            {step.title}
          </h3>
        </div>
        <button onClick={onSkip} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#9CA3AF', flexShrink: 0, marginTop: 2 }}>
          <X size={15} />
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#F3F4F6', margin: '0 16px' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#E8834A', borderRadius: 2, transition: 'width 0.3s ease' }} />
      </div>

      {/* Body */}
      <div style={{ padding: '12px 16px' }}>
        <p style={{ margin: 0, fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>
          {step.description}
        </p>
        {step.actionHint && (
          <div style={{ marginTop: 10, padding: '8px 10px', background: '#FEF3EC', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8834A', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#E8834A', fontWeight: 600 }}>{step.actionHint}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 16px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {hasCustomButtons ? (
          /* Custom button layout (welcome intro / done steps) */
          <div style={{ width: '100%' }}>
            {step.primaryBtn && (
              <button onClick={handlePrimary} style={{
                width: '100%', padding: '10px', background: '#E8834A', color: 'white',
                border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                marginBottom: step.secondaryBtn ? 8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                {step.primaryBtn.label} <ArrowRight size={14} />
              </button>
            )}
            {step.secondaryBtn && (
              <button onClick={handleSecondary} style={{
                width: '100%', padding: '9px', background: '#F8F6F3', color: '#6B7280',
                border: '1px solid #E8E4DF', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                {step.secondaryBtn.label}
              </button>
            )}
          </div>
        ) : (
          /* Standard nav buttons */
          <>
            <button onClick={onSkip} style={{ fontSize: 11.5, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginRight: 'auto' }}>
              Skip tutorial
            </button>
            {!isFirst && (
              <button onClick={onPrev} style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
                background: 'white', border: '1px solid #E8E4DF', borderRadius: 8,
                fontSize: 12.5, fontWeight: 600, color: '#6B7280', cursor: 'pointer',
              }}>
                <ArrowLeft size={12} /> Back
              </button>
            )}
            {isLast ? (
              <button onClick={() => onComplete()} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px',
                background: '#22C55E', border: 'none', borderRadius: 8,
                fontSize: 12.5, fontWeight: 700, color: 'white', cursor: 'pointer',
              }}>
                <Check size={13} /> Got it!
              </button>
            ) : (
              <button onClick={onNext} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px',
                background: '#E8834A', border: 'none', borderRadius: 8,
                fontSize: 12.5, fontWeight: 700, color: 'white', cursor: 'pointer',
              }}>
                Next <ArrowRight size={12} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
