'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTutorial } from './TutorialContext';
import { getTutorial } from '../../lib/tutorials';
import TutorialTooltip from './TutorialTooltip';

interface TargetRect {
  top: number; left: number; width: number; height: number;
}

const PAD = 10;
const TOOLTIP_WIDTH = 320;
const TOOLTIP_ESTIMATED_HEIGHT = 220;

function getRect(selector: string): TargetRect | null {
  try {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  } catch {
    return null;
  }
}

function calcTooltipPos(rect: TargetRect, position: string): { top: number; left: number; arrowSide: string } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gap = 16;
  let top = 0, left = 0, arrowSide = '';

  switch (position) {
    case 'right':
      top = rect.top + rect.height / 2 - TOOLTIP_ESTIMATED_HEIGHT / 2;
      left = rect.left + rect.width + gap;
      arrowSide = 'left';
      break;
    case 'left':
      top = rect.top + rect.height / 2 - TOOLTIP_ESTIMATED_HEIGHT / 2;
      left = rect.left - TOOLTIP_WIDTH - gap;
      arrowSide = 'right';
      break;
    case 'bottom':
      top = rect.top + rect.height + gap;
      left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
      arrowSide = 'top';
      break;
    case 'top':
      top = rect.top - TOOLTIP_ESTIMATED_HEIGHT - gap;
      left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
      arrowSide = 'bottom';
      break;
    case 'center':
      top = vh / 2 - TOOLTIP_ESTIMATED_HEIGHT / 2;
      left = vw / 2 - TOOLTIP_WIDTH / 2;
      break;
    default:
      top = vh / 2 - TOOLTIP_ESTIMATED_HEIGHT / 2;
      left = vw / 2 - TOOLTIP_WIDTH / 2;
  }

  // Clamp within viewport
  top = Math.max(16, Math.min(top, vh - TOOLTIP_ESTIMATED_HEIGHT - 16));
  left = Math.max(16, Math.min(left, vw - TOOLTIP_WIDTH - 16));

  return { top, left, arrowSide };
}

export default function TutorialEngine() {
  const { activeTutorialId, currentStep, nextStep, prevStep, skipTutorial, completeTutorial } = useTutorial();
  const [rect, setRect] = useState<TargetRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const updateRect = useCallback(() => {
    if (!activeTutorialId) return;
    const tutorial = getTutorial(activeTutorialId);
    if (!tutorial) return;
    const step = tutorial.steps[currentStep];
    if (!step) return;

    if (!step.target || step.position === 'center') {
      setRect(null);
      setVisible(true);
      return;
    }

    const r = getRect(step.target);
    if (r) {
      setRect(r);
      setVisible(true);
    } else {
      // Target not in DOM yet — retry a few times
      setVisible(false);
      if (retryRef.current) clearTimeout(retryRef.current);
      retryRef.current = setTimeout(() => {
        const r2 = getRect(step.target!);
        if (r2) { setRect(r2); setVisible(true); }
        else { setRect(null); setVisible(true); } // show center if target never found
      }, 400);
    }
  }, [activeTutorialId, currentStep]);

  useEffect(() => {
    if (!activeTutorialId) { setVisible(false); setRect(null); return; }
    setVisible(false);
    const t = setTimeout(updateRect, 80);
    return () => clearTimeout(t);
  }, [activeTutorialId, currentStep, updateRect]);

  useEffect(() => {
    if (!visible) return;
    const handleResize = () => updateRect();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visible, updateRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!activeTutorialId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skipTutorial();
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTutorialId, nextStep, prevStep, skipTutorial]);

  if (!mounted || !activeTutorialId || !visible) return null;

  const tutorial = getTutorial(activeTutorialId);
  if (!tutorial) return null;
  const step = tutorial.steps[currentStep];
  if (!step) return null;

  const isCenter = step.position === 'center' || !step.target;
  const tooltipPos = rect ? calcTooltipPos(rect, step.position) : {
    top: window.innerHeight / 2 - TOOLTIP_ESTIMATED_HEIGHT / 2,
    left: window.innerWidth / 2 - TOOLTIP_WIDTH / 2,
    arrowSide: '',
  };

  const totalSteps = tutorial.steps.length;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 99990, pointerEvents: 'none' }}>
      {/* Spotlight overlay — 4 panels */}
      {!isCenter && rect ? (
        <>
          {/* Top */}
          <div style={{
            position: 'fixed', top: 0, left: 0,
            width: '100%', height: Math.max(0, rect.top - PAD),
            background: 'rgba(0,0,0,0.62)', pointerEvents: 'all',
          }} onClick={skipTutorial} />
          {/* Left */}
          <div style={{
            position: 'fixed',
            top: Math.max(0, rect.top - PAD), left: 0,
            width: Math.max(0, rect.left - PAD),
            height: rect.height + PAD * 2,
            background: 'rgba(0,0,0,0.62)', pointerEvents: 'all',
          }} onClick={skipTutorial} />
          {/* Right */}
          <div style={{
            position: 'fixed',
            top: Math.max(0, rect.top - PAD),
            left: rect.left + rect.width + PAD,
            right: 0,
            height: rect.height + PAD * 2,
            background: 'rgba(0,0,0,0.62)', pointerEvents: 'all',
          }} onClick={skipTutorial} />
          {/* Bottom */}
          <div style={{
            position: 'fixed',
            top: rect.top + rect.height + PAD,
            left: 0, width: '100%', bottom: 0,
            background: 'rgba(0,0,0,0.62)', pointerEvents: 'all',
          }} onClick={skipTutorial} />
          {/* Orange glow border */}
          <div style={{
            position: 'fixed',
            top: rect.top - PAD, left: rect.left - PAD,
            width: rect.width + PAD * 2, height: rect.height + PAD * 2,
            borderRadius: 10, border: '2px solid #E8834A',
            boxShadow: '0 0 0 4px rgba(232,131,74,0.25), 0 0 20px rgba(232,131,74,0.2)',
            pointerEvents: 'none',
            animation: 'tutorialGlow 2s ease-in-out infinite',
          }} />
        </>
      ) : (
        /* Full backdrop for center modals */
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          pointerEvents: 'all',
        }} onClick={isCenter ? undefined : skipTutorial} />
      )}

      {/* Tooltip */}
      <div style={{ pointerEvents: 'all' }}>
        <TutorialTooltip
          step={step}
          stepIndex={currentStep}
          totalSteps={totalSteps}
          top={tooltipPos.top}
          left={tooltipPos.left}
          arrowSide={tooltipPos.arrowSide}
          isCenter={isCenter}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTutorial}
          onComplete={completeTutorial}
        />
      </div>

      <style>{`
        @keyframes tutorialGlow {
          0%,100% { box-shadow: 0 0 0 4px rgba(232,131,74,0.25), 0 0 20px rgba(232,131,74,0.2); }
          50% { box-shadow: 0 0 0 6px rgba(232,131,74,0.35), 0 0 30px rgba(232,131,74,0.35); }
        }
        @keyframes tutorialFadeIn {
          from { opacity:0; transform: scale(0.95) translateY(8px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
