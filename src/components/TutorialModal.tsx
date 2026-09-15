import React, { useState } from 'react';
import { 
  ChevronRight, ChevronLeft, X, Sparkles, Home, Repeat, 
  CheckSquare, Play, Calendar, Bell, TrendingUp, BookOpen, 
  Settings, QrCode, Heart, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TutorialModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface StepContent {
  stepNumber: number;
  title: string;
  badge: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  headline: string;
  description: string;
  bullets?: { label: string; text: string }[];
  highlightBox?: { title?: string; text: string; icon?: string };
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onComplete, onSkip }) => {
  const { themeConfig } = useApp();
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps: StepContent[] = [
    // Step 1 — Welcome to Nudge
    {
      stepNumber: 1,
      title: 'Welcome to Nudge',
      badge: 'Getting Started',
      emoji: '🌿',
      icon: Sparkles,
      headline: 'Small, manageable actions for everyday life.',
      description:
        'Welcome to Nudge. Nudge helps you turn overwhelming days into small, manageable actions. You do not need to do everything perfectly. You can start with one small step.',
      bullets: [
        { label: 'Everyday Self-Care', text: 'Gentle support for your morning, evening, and daily rhythms.' },
        { label: 'Zero Pressure', text: 'Take tiny actions without guilt or complicated systems.' },
        { label: 'Private & Local', text: 'All your routines, checklists, and reflections stay on your device.' },
      ],
      highlightBox: {
        icon: '💡',
        title: 'Mindful Philosophy',
        text: 'Progress is built on momentum, not perfection. Beginning is always enough.',
      },
    },

    // Step 2 — The Home Screen
    {
      stepNumber: 2,
      title: 'The Home Screen',
      badge: 'Daily Hub',
      emoji: '☀️',
      icon: Home,
      headline: 'Your central place to see the day and begin tasks.',
      description:
        'The Home screen gives you a quick, calming view of what matters today. It is designed to keep you oriented without visual clutter or stress.',
      bullets: [
        { label: 'Greeting & Date', text: 'A personalized greeting with the current date to ground your morning.' },
        { label: 'Daily Completion Rate', text: 'A clear progress bar showing how much you have accomplished today.' },
        { label: 'Motivational Tip', text: 'A rotating, gentle reminder offering encouragement whenever you need it.' },
        { label: 'Current Mode & Energy', text: 'Quickly toggle Low Energy Mode when you need shorter, essential routines.' },
        { label: 'Today’s Agenda', text: 'Scheduled routines, checklists, backpacks, tasks, and reminders at a glance.' },
        { label: 'Quick Action Buttons', text: 'One-tap access to Start My Day, Just Start, Quick Add, and Brain Dump.' },
      ],
    },

    // Step 3 — Routines
    {
      stepNumber: 3,
      title: 'Routines',
      badge: 'Habits & Flow',
      emoji: '🔄',
      icon: Repeat,
      headline: 'Groups of meaningful activities completed in sequence.',
      description:
        'Routines group related activities together so you can move smoothly through your day. Completing even part of a routine still counts as useful, real progress.',
      bullets: [
        { label: 'Common Routines', text: 'Morning wake-up, bedtime wind-down, work prep, study sessions, and gym warmups.' },
        { label: 'Custom Creations', text: 'Customize names, emojis, colors, descriptions, estimated duration, and step orders.' },
        { label: 'Flexible Activities', text: 'Choose preprogrammed activities or build your own custom step-by-step tasks.' },
        { label: 'Guided Routine Mode', text: 'Step-by-step full-screen focus mode that gently walks you through each action.' },
        { label: 'Full vs. Low-Energy', text: 'Each routine supports low-energy shortcuts for days when your bandwidth is low.' },
      ],
      highlightBox: {
        icon: '🌱',
        title: 'Partial is Success',
        text: 'Doing 2 out of 5 steps is infinitely better than doing none. Celebrate every small win.',
      },
    },

    // Step 4 — Checklists and Backpacks
    {
      stepNumber: 4,
      title: 'Checklists & Backpacks',
      badge: 'Organization',
      emoji: '🎒',
      icon: CheckSquare,
      headline: 'Reusable checklists for tasks and packing lists for essentials.',
      description:
        'Never worry about forgetting what needs doing or what to bring before walking out the door.',
      bullets: [
        { label: 'Checklists', text: 'Reusable task lists for recurring projects, chores, work milestones, or reset routines.' },
        { label: 'Backpacks', text: 'Dedicated packing lists for items you need to carry with you when you leave home.' },
        { label: 'Examples', text: 'Work bag, school supplies, gym gear, travel kit, medication reminders, keys, wallet, phone, and chargers.' },
        { label: 'Rich Customization', text: 'Set icons, colors, item quantities, and flag items as “Required” to prevent missing essentials.' },
        { label: 'Missing Item Alerts', text: 'Backpacks immediately highlight unbacked items before you step out.' },
      ],
    },

    // Step 5 — Starting Difficult Tasks
    {
      stepNumber: 5,
      title: 'Starting Difficult Tasks',
      badge: 'Overcoming Friction',
      emoji: '⏱️',
      icon: Play,
      headline: 'Tools designed to help you begin instead of waiting for motivation.',
      description:
        'Executive dysfunction and hesitation make starting the hardest part. Nudge gives you specialized kick-starters to break task paralysis.',
      bullets: [
        { label: 'Start My Day', text: 'A gentle 3-step ritual to set your daily intention, mood, and pick your primary focus.' },
        { label: 'Mental Countdown (Just Start)', text: 'A smooth, sensory countdown timer (3s, 5s, or 10s) to transition your mind into motion.' },
        { label: 'Smallest First Action', text: 'Break overwhelming tasks into the micro-action that requires zero emotional resistance.' },
      ],
      highlightBox: {
        icon: '✨',
        title: 'Examples of Micro-Starts',
        text: '• Put toothpaste on the toothbrush.\n• Open the blank document.\n• Put food on a fork.\n• Slip on one shoe.\n• Pick up the first item.\nYou do not have to finish right away; beginning creates immediate momentum.',
      },
    },

    // Step 6 — Calendar and Scheduling
    {
      stepNumber: 6,
      title: 'Calendar & Scheduling',
      badge: 'Planning Ahead',
      emoji: '📅',
      icon: Calendar,
      headline: 'Month, Week, and Day views to plan ahead with ease.',
      description:
        'While the Home screen focuses on today, the Calendar lets you map out your upcoming schedule, view journal reflections, and review past achievements.',
      bullets: [
        { label: 'Three Flexible Views', text: 'Switch smoothly between full Month overview, 7-Day Week layout, or detailed single Day agenda.' },
        { label: 'Seamless Navigation', text: 'Move between dates easily and jump right back to Today with a single tap.' },
        { label: 'Scheduled Tasks & Routines', text: 'Schedule specific routines, checklists, or individual tasks for any date and time.' },
        { label: 'Recurring Rules', text: 'Repeat tasks daily, on weekdays, every other day, weekly, or on custom intervals.' },
        { label: 'Reflection Integration', text: 'Read journal reflections and moods tied directly to any calendar day.' },
      ],
    },

    // Step 7 — Timer, Reminders, and Notifications
    {
      stepNumber: 7,
      title: 'Timer, Reminders & Notifications',
      badge: 'Helpful Nudges',
      emoji: '🔔',
      icon: Bell,
      headline: 'Supportive nudges and customizable countdown timers.',
      description:
        'Notifications in Nudge are gentle invitations designed to guide you, never annoying demands or punishments.',
      bullets: [
        { label: 'Configurable Countdown', text: 'Customize your start countdown duration (3s, 5s, or 10s) with pleasant audio chimes.' },
        { label: 'Scheduled Task Reminders', text: 'Set reminders for important routines, packing backpacks, or daily tasks.' },
        { label: 'Quiet Hours', text: 'Define quiet hours (e.g., 10 PM to 7 AM) so your rest is always fully protected.' },
        { label: 'Mindful Tone', text: 'Reminders act as soft nudges to help you stay present and on track with your self-care.' },
      ],
    },

    // Step 8 — Progress, Streaks, and Checked Off
    {
      stepNumber: 8,
      title: 'Progress, Streaks & Checked Off',
      badge: 'Self-Compassion',
      emoji: '📈',
      icon: TrendingUp,
      headline: 'Use progress as information, not as a reason for guilt.',
      description:
        'Track your consistency, review completed items, and watch your daily momentum grow over time.',
      bullets: [
        { label: 'Completion Percentages', text: 'Real-time insight into daily, weekly, and monthly activity completion.' },
        { label: 'Consistency Streaks', text: 'Track active streaks and celebrate your personal bests.' },
        { label: 'The Checked Off Area', text: 'Review past items to remind yourself of how much you have already tackled.' },
        { label: 'Self-Compassion First', text: 'Missing a day never erases your progress. Simply pick up where you left off tomorrow.' },
      ],
    },

    // Step 9 — Journal and Reflection
    {
      stepNumber: 9,
      title: 'Journal & Daily Reflection',
      badge: 'Mindful Space',
      emoji: '📖',
      icon: BookOpen,
      headline: 'A safe, private space to reflect on your thoughts and wins.',
      description:
        'Capture your emotional headspace, daily wins, challenges, or mindful observations in an accessible daily journal.',
      bullets: [
        { label: 'Mood Tracking', text: 'Attach mood emojis (Happy, Calm, Anxious, Tired, Grateful) to each entry.' },
        { label: 'Calendar Connected', text: 'Entries link automatically to dates so you can look back on how your mood shifted.' },
        { label: 'Thought Starters', text: 'Gentle prompts to help you write without feeling intimidated by a blank page.' },
        { label: '100% Private', text: 'Your reflections are stored locally on your device and are never sent anywhere.' },
      ],
    },

    // Step 10 — Personalization and Settings
    {
      stepNumber: 10,
      title: 'Personalization & Settings',
      badge: 'Make It Yours',
      emoji: '⚙️',
      icon: Settings,
      headline: 'Tailor Nudge to your personal pace, aesthetic, and preferences.',
      description:
        'You do not need to configure everything today. Adjust settings whenever you feel like changing your experience.',
      bullets: [
        { label: 'Personal Greeting', text: 'Set your preferred name or nickname for a warm welcome on the Home screen.' },
        { label: 'Color Themes', text: 'Choose from Pastel, Dark, Minimal, Nature, Retro, Y2K, and Monochrome palettes.' },
        { label: 'Sound & Haptic Feedback', text: 'Toggle soothing completion chimes, countdown audio, and vibration feedback.' },
        { label: 'Backups & Restores', text: 'Export or import your data JSON file anytime to keep your routines completely safe.' },
      ],
    },

    // Step 11 — QR Sharing and Importing
    {
      stepNumber: 11,
      title: 'QR Sharing & Importing',
      badge: 'Easy Sharing',
      emoji: '📱',
      icon: QrCode,
      headline: 'Share routines and checklists with friends in seconds.',
      description:
        'Quickly exchange helpful routines, checklists, or packing lists without needing user accounts or server links.',
      bullets: [
        { label: 'Generate QR Codes', text: 'Export any routine, checklist, or backpack into a high-density, shareable QR code.' },
        { label: 'Instant Camera Scan', text: 'Scan a friend’s QR code directly with your device camera or upload an image.' },
        { label: 'Safety Preview', text: 'Inspect all activities, colors, and items before deciding to add them to your Nudge library.' },
        { label: 'Completely Optional', text: 'Explore QR sharing whenever you are ready—no setup is required.' },
      ],
    },

    // Step 12 — Final Encouragement
    {
      stepNumber: 12,
      title: 'Ready to Begin',
      badge: 'One Small Step',
      emoji: '✨',
      icon: Heart,
      headline: 'You are all set to start your journey.',
      description:
        'Nudge is here to help you take the next small step. Start with one routine, checklist, or task. You can always adjust things later.',
      bullets: [
        { label: 'No Overwhelm', text: 'Focus only on what is in front of you right now.' },
        { label: 'Adapt as You Go', text: 'Edit or add steps whenever your schedule changes.' },
        { label: 'Be Kind to Yourself', text: 'Every small effort counts toward a happier, calmer day.' },
      ],
      highlightBox: {
        icon: '🌿',
        title: 'Your First Step',
        text: 'Tap “Get Started” below to enter your Home screen and try your first nudge!',
      },
    },
  ];

  const current = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div
      id="nudge-tutorial-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto transition-all max-h-[92vh]"
        style={{
          backgroundColor: themeConfig.bgCard,
          borderColor: themeConfig.border,
          color: themeConfig.textPrimary,
        }}
      >
        {/* Top Header Bar with Progress & Skip */}
        <div
          className="px-5 sm:px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: themeConfig.border, backgroundColor: themeConfig.bgMain }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{current.emoji}</span>
            <div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: themeConfig.accentSubtle,
                  color: themeConfig.accentText,
                }}
              >
                Step {current.stepNumber} of {steps.length}
              </span>
              <h2 className="text-sm sm:text-base font-bold tracking-tight truncate max-w-[200px] sm:max-w-xs mt-0.5" style={{ color: themeConfig.textPrimary }}>
                {current.title}
              </h2>
            </div>
          </div>

          <button
            id="tutorial-skip-btn"
            type="button"
            onClick={onSkip}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            style={{ color: themeConfig.textMuted }}
            title="Skip tutorial and go to app"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Step Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-4 sm:space-y-5 flex-1 min-w-0">
          {/* Main Headline & Description */}
          <div>
            <h3
              className="text-lg sm:text-xl font-extrabold tracking-tight leading-snug mb-2"
              style={{ color: themeConfig.textPrimary }}
            >
              {current.headline}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeConfig.textSecondary }}>
              {current.description}
            </p>
          </div>

          {/* Bulleted Points */}
          {current.bullets && current.bullets.length > 0 && (
            <div
              className="p-4 rounded-2xl border space-y-2.5"
              style={{
                backgroundColor: themeConfig.bgMain,
                borderColor: themeConfig.border,
              }}
            >
              {current.bullets.map((b, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: themeConfig.accent }}
                  />
                  <div className="leading-relaxed">
                    <strong className="font-bold" style={{ color: themeConfig.textPrimary }}>
                      {b.label}:
                    </strong>{' '}
                    <span style={{ color: themeConfig.textSecondary }}>{b.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Highlight Callout Box if present */}
          {current.highlightBox && (
            <div
              className="p-4 rounded-2xl border flex items-start gap-3"
              style={{
                backgroundColor: `${themeConfig.accent}15`,
                borderColor: `${themeConfig.accent}35`,
              }}
            >
              <span className="text-xl shrink-0">{current.highlightBox.icon || '💡'}</span>
              <div className="text-xs sm:text-sm space-y-1">
                {current.highlightBox.title && (
                  <p className="font-bold" style={{ color: themeConfig.textPrimary }}>
                    {current.highlightBox.title}
                  </p>
                )}
                <p className="whitespace-pre-line leading-relaxed" style={{ color: themeConfig.textSecondary }}>
                  {current.highlightBox.text}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step Indicator Dots & Navigation Buttons */}
        <div
          className="px-5 sm:px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
          style={{ borderColor: themeConfig.border, backgroundColor: themeConfig.bgMain }}
        >
          {/* Indicator dots */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
            {steps.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  currentStep === idx
                    ? 'w-6 h-2 rounded-full'
                    : 'w-2 h-2 opacity-40 hover:opacity-75'
                }`}
                style={{
                  backgroundColor: currentStep === idx ? themeConfig.accent : themeConfig.textMuted,
                }}
                aria-label={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Controls: Back & Next / Get Started */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {!isFirstStep && (
              <button
                id="tutorial-prev-btn"
                type="button"
                onClick={handlePrev}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer"
                style={{ borderColor: themeConfig.border, color: themeConfig.textPrimary }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              id={isLastStep ? 'tutorial-get-started-btn' : 'tutorial-next-btn'}
              type="button"
              onClick={handleNext}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white shadow-md flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              style={{ backgroundColor: themeConfig.accent }}
            >
              <span>{isLastStep ? 'Get Started' : 'Next'}</span>
              {isLastStep ? <ArrowRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
