export interface TutorialStep {
  id: string;
  target?: string;          // CSS selector; omit for center modal
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  actionHint?: string;
  spotlight?: boolean;       // default: true when target exists
  primaryBtn?: { label: string; action: 'next' | 'complete'; href?: string };
  secondaryBtn?: { label: string; action: 'skip' | 'next' | 'complete'; href?: string };
}

export interface Tutorial {
  id: string;
  name: string;
  steps: TutorialStep[];
}

export const TUTORIALS: Tutorial[] = [
  {
    id: 'welcome',
    name: 'Welcome Tour',
    steps: [
      {
        id: 'welcome-intro',
        position: 'center',
        title: 'Welcome to ProSite!',
        description: "You're now running your remodeling business from one place. Let's take a 2-minute tour to get you started.",
        primaryBtn: { label: 'Take the Tour', action: 'next' },
        secondaryBtn: { label: 'Skip for now', action: 'skip' },
      },
      {
        id: 'welcome-dashboard',
        target: '[data-tutorial="nav-dashboard"]',
        position: 'right',
        title: 'Your Dashboard',
        description: 'This is your command center. See all your active projects, upcoming tasks, and money owed at a glance.',
      },
      {
        id: 'welcome-clients',
        target: '[data-tutorial="nav-clients"]',
        position: 'right',
        title: 'Clients',
        description: 'Store all your client information here. Every quote, project, and invoice is linked to a client.',
      },
      {
        id: 'welcome-quotes',
        target: '[data-tutorial="nav-quotes"]',
        position: 'right',
        title: 'Quotes',
        description: 'Create professional quotes and send them to clients for approval. When approved, they convert to projects automatically.',
      },
      {
        id: 'welcome-projects',
        target: '[data-tutorial="nav-projects"]',
        position: 'right',
        title: 'Projects',
        description: 'Track every job from start to finish. Assign subcontractors, upload photos, and manage checklists.',
      },
      {
        id: 'welcome-invoices',
        target: '[data-tutorial="nav-invoices"]',
        position: 'right',
        title: 'Invoices',
        description: "Generate deposit, progress, and final invoices. Track what's been paid and what's outstanding.",
      },
      {
        id: 'welcome-schedule',
        target: '[data-tutorial="nav-schedule"]',
        position: 'right',
        title: 'Schedule',
        description: 'See all your appointments and tasks on a calendar. Never miss a site visit or meeting.',
      },
      {
        id: 'welcome-settings',
        target: '[data-tutorial="nav-settings"]',
        position: 'right',
        title: 'Settings — Important!',
        description: 'Add your company logo and information here. It will appear on all your quotes and invoices, making them look professional.',
        actionHint: 'We recommend doing this first!',
      },
      {
        id: 'welcome-done',
        position: 'center',
        title: "You're all set!",
        description: "Start by adding your company info in Settings, then add your first client. We're here if you need help.",
        primaryBtn: { label: 'Go to Settings', action: 'complete', href: '/settings' },
        secondaryBtn: { label: 'Add First Client', action: 'complete', href: '/clients' },
      },
    ],
  },

  {
    id: 'create_client',
    name: 'Adding Clients',
    steps: [
      {
        id: 'client-btn',
        target: '[data-tutorial="new-client-btn"]',
        position: 'bottom',
        title: 'Add Your First Client',
        description: "Every project starts with a client. Click here to add your first one.",
        actionHint: "Click '+ New Client' to continue",
      },
      {
        id: 'client-name',
        target: '[data-tutorial="client-first-name"]',
        position: 'right',
        title: 'Client Information',
        description: "Fill in the client's name and contact details. Phone is required — it's how you'll reach them on the job.",
      },
      {
        id: 'client-address',
        target: '[data-tutorial="client-address"]',
        position: 'right',
        title: 'Smart Address Search',
        description: 'Start typing the address and ProSite will suggest real addresses. Click one to auto-fill city, state, and ZIP.',
      },
      {
        id: 'client-save',
        target: '[data-tutorial="client-save-btn"]',
        position: 'top',
        title: 'Save the Client',
        description: 'Click Save to add this client to your system. You can always edit their info later.',
      },
    ],
  },

  {
    id: 'create_quote',
    name: 'Creating Quotes',
    steps: [
      {
        id: 'quote-client',
        target: '[data-tutorial="quote-client"]',
        position: 'bottom',
        title: 'Select a Client',
        description: "Start typing the client's name and select them from the dropdown. If they're not in the system yet, you can add them right here.",
      },
      {
        id: 'quote-service',
        target: '[data-tutorial="quote-service"]',
        position: 'bottom',
        title: 'Type of Work',
        description: 'Select the type of remodeling service. This helps organize your quotes and reports.',
      },
      {
        id: 'quote-title',
        target: '[data-tutorial="quote-title"]',
        position: 'bottom',
        title: 'Quote Title',
        description: "Give this quote a clear name like 'Master Bath Renovation' or 'Kitchen Remodel Phase 1'.",
      },
      {
        id: 'quote-add-item',
        target: '[data-tutorial="quote-add-item"]',
        position: 'left',
        title: 'Add Line Items',
        description: 'Break down the work into line items. Each item has a description, quantity, and price. Be as detailed as possible — it builds trust with clients.',
      },
      {
        id: 'quote-total',
        target: '[data-tutorial="quote-total"]',
        position: 'top',
        title: 'Automatic Total',
        description: 'ProSite calculates the total automatically as you add items. No math needed!',
      },
      {
        id: 'quote-save',
        target: '[data-tutorial="quote-save-send"]',
        position: 'left',
        title: 'Save Your Quote',
        description: "'Save Draft' keeps it private. 'Save & Send' marks it as sent to the client. When they approve, it becomes a project automatically!",
      },
    ],
  },

  {
    id: 'create_task',
    name: 'Schedule & Tasks',
    steps: [
      {
        id: 'task-btn',
        target: '[data-tutorial="new-task-btn"]',
        position: 'bottom',
        title: 'Schedule a Task',
        description: "Add site visits, meetings, inspections, and any appointment here. They'll appear on your calendar.",
      },
      {
        id: 'task-date',
        target: '[data-tutorial="task-date"]',
        position: 'right',
        title: 'Pick a Date and Time',
        description: 'Set when this task happens. Tasks show up on the calendar so you can see your full schedule at a glance.',
      },
      {
        id: 'task-type',
        target: '[data-tutorial="task-type"]',
        position: 'right',
        title: 'Task Type',
        description: 'Categorize your tasks. Each type has a different color on the calendar — easy to see what kind of day you have.',
      },
    ],
  },

  {
    id: 'settings_setup',
    name: 'Settings Setup',
    steps: [
      {
        id: 'settings-name',
        target: '[data-tutorial="company-name"]',
        position: 'bottom',
        title: 'Your Company Name',
        description: 'This appears on all your quotes and invoices. Make sure it matches your official business name.',
      },
      {
        id: 'settings-logo',
        target: '[data-tutorial="logo-upload"]',
        position: 'right',
        title: 'Upload Your Logo',
        description: 'Your logo will appear on every quote and invoice you send. This makes your documents look professional and branded.',
        actionHint: 'Click to upload your logo (JPG or PNG)',
      },
      {
        id: 'settings-color',
        target: '[data-tutorial="brand-color"]',
        position: 'right',
        title: 'Your Brand Color',
        description: "Choose your company's main color. It will be used as the accent color on your documents.",
      },
      {
        id: 'settings-save',
        target: '[data-tutorial="settings-save-btn"]',
        position: 'bottom',
        title: 'Save Your Settings',
        description: 'Save your company info. From now on, every document you create will have your branding.',
      },
    ],
  },
];

export function getTutorial(id: string): Tutorial | undefined {
  return TUTORIALS.find(t => t.id === id);
}

export function isTutorialCompleted(id: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`tutorial_completed_${id}`) === '1';
}

export function isTutorialSkipped(id: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`tutorial_skipped_${id}`) === '1';
}

export function areTutorialsDisabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('tutorials_disabled') === '1';
}

export function shouldShowTutorial(id: string): boolean {
  if (areTutorialsDisabled()) return false;
  if (isTutorialCompleted(id)) return false;
  if (isTutorialSkipped(id)) return false;
  return true;
}
