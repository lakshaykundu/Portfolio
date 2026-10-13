import {
  ArrowBigRightDash,
  Atom,
  Bot,
  Braces,
  ChartColumn,
  GraduationCap,
  type IconNode,
  Languages,
  LayoutTemplate,
  Puzzle,
  ShieldCheck,
  Timer,
} from 'lucide'

export const PROFILE = {
  name: 'Lakshay Kumar',
  role: 'Frontend Engineer',
  intro:
    'I build scalable products and optimise them to stay fast, with React, Chrome extensions and AI agents. This is how I got here.',
}

export type StoryLink = {
  label: string
  href: string
  /** File name to save as. Set for files offered as a download rather than a page. */
  download?: string
}

export type StoryNode = {
  id: string
  /** Short name drawn on the board under the node. */
  label: string
  /** Full name on the card. */
  title: string
  description: string
  /** Headline number, shown first on the card. */
  impact?: string
  tags?: string[]
  links?: StoryLink[]
  icon: IconNode
  /** The two public side projects get large detailed models instead of a plain node. */
  hero?: boolean
}

export type Stop = {
  id: string
  title: string
  period: string
  /** One line on the card under the title. */
  summary: string
  /** Buttons under the summary, for the stop as a whole (the finale's contact links). */
  links?: StoryLink[]
  /** Distance along the board's diagonal. Later stops sit further along. */
  along: number
  /** Sideways nudge off the diagonal, so the path snakes between stops. */
  side: number
  nodes: StoryNode[]
}

export const STOPS: Stop[] = [
  {
    id: 'college',
    title: 'College',
    period: '2020 – 2024',
    summary: 'Chandigarh University, Mohali.',
    along: 0,
    side: 2,
    nodes: [
      {
        id: 'btech',
        label: 'B.Tech CSE',
        title: 'B.Tech, Computer Science',
        description:
          'Four years of computer science fundamentals, and where I started building for the web with JavaScript and React.',
        tags: ['JavaScript', 'React · Coursera'],
        icon: GraduationCap,
      },
    ],
  },
  {
    id: 'intern',
    title: 'SenseHQ · Intern',
    period: 'Oct 2024 – Mar 2025',
    summary: 'Frontend intern on an enterprise recruitment CRM, Bengaluru.',
    along: 13,
    side: -2,
    nodes: [
      {
        id: 'i18n',
        label: 'i18n',
        title: 'Internationalization',
        description:
          'Made the CRM multilingual, with the language set at load time or switched live inside the app.',
        impact: '20+ customers',
        tags: ['React', 'i18n'],
        icon: Languages,
      },
      {
        id: 'codemod',
        label: 'AST codemod',
        title: 'Translation codemod',
        description:
          'An AST-based parser that scans the app bundle and automatically wraps every UI label for translation.',
        tags: ['AST', 'Codemods'],
        icon: Braces,
      },
    ],
  },
  {
    id: 'sde1',
    title: 'SenseHQ · SDE-1',
    period: 'Sept 2025 – now',
    summary: 'I own the hiring workflows for candidates and jobs in the CRM.',
    along: 26,
    side: 2,
    nodes: [
      {
        id: 'chrome-extension',
        label: 'Chrome extension',
        title: 'Recruiter Chrome extension',
        description:
          'Recruiters pull a LinkedIn profile and resume into the CRM, then add the candidate to the talent pool or refer them to a job.',
        impact: '15+ customers',
        tags: ['Chrome extension', 'React'],
        icon: Puzzle,
      },
      {
        id: 'chart-wrapper',
        label: 'Chart wrapper',
        title: 'Config-driven charts',
        description:
          'A config-driven Highcharts wrapper for the internal design system, so any team can drop in reusable, customisable charts.',
        tags: ['Design system', 'Highcharts'],
        icon: ChartColumn,
      },
      {
        id: 'migration',
        label: 'UI migration',
        title: 'Legacy → redesigned UI',
        description: 'Led the migration of customers from the legacy CRM interface to the redesign.',
        impact: '35+ customers',
        tags: ['React', 'Migration'],
        icon: ArrowBigRightDash,
      },
    ],
  },
  {
    id: 'hackathons',
    title: 'Hackathons',
    period: 'SenseHQ',
    summary: 'Three AI builds from internal hackathons.',
    along: 40,
    side: -2,
    nodes: [
      {
        id: 'career-site-builder',
        label: 'Career Site Builder',
        title: 'Agentic Career Site Builder',
        description:
          'Recruiters describe their company in plain English and an AI agent builds the career site, with a job board candidates can apply from.',
        tags: ['AI agents', 'LLMs', 'React'],
        icon: LayoutTemplate,
      },
      {
        id: 'ai-recruiter',
        label: 'AI Recruiter',
        title: 'AI Recruiter',
        description:
          'Interviews candidates on its own, then hands recruiters a score, a summary, and any suspicious behaviour it caught.',
        tags: ['LLMs', 'React'],
        icon: Bot,
      },
      {
        id: 'aegis',
        label: 'Aegis',
        title: 'Aegis',
        description:
          'When an error reaches Sentry, a GitHub Action opens a fix PR and asks the module owner to review it.',
        tags: ['Sentry', 'GitHub Actions', 'LLMs'],
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: 'projects',
    title: 'Side projects',
    period: '2026',
    summary: 'Things I build on my own time.',
    along: 56,
    side: 2,
    nodes: [
      {
        id: 'react-learn',
        label: 'React-Learn',
        title: 'React-Learn',
        description:
          'An interactive visualiser of what React does between a click and a pixel. Every step is traced from real running components, never pre-recorded.',
        tags: ['React 19', 'TypeScript', 'Framer Motion'],
        links: [
          { label: 'Live', href: 'https://react-learn-workwithlakshay.vercel.app' },
          { label: 'GitHub', href: 'https://github.com/lakshaykundu/react-learn' },
        ],
        icon: Atom,
        hero: true,
      },
      {
        id: 'focusguard',
        label: 'FocusGuard',
        title: 'FocusGuard',
        description:
          'A privacy-first Chrome extension that blocks distracting sites during focus sessions, and keeps YouTube usable for tutorials.',
        tags: ['Manifest V3', 'WXT', 'React 19'],
        links: [{ label: 'GitHub', href: 'https://github.com/lakshaykundu/Focus-mode' }],
        icon: Timer,
        hero: true,
      },
    ],
  },
  {
    id: 'kickboxer',
    title: 'Kickboxer',
    period: 'Off the keyboard',
    summary: 'Same rule in the ring and in the code: discipline builds freedom.',
    links: [
      { label: 'Email', href: 'mailto:workwithlakshay1@gmail.com' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lakshaykumar-sde' },
      { label: 'GitHub', href: 'https://github.com/lakshaykundu' },
      {
        label: 'Resume',
        href: '/Lakshay_Kumar_Resume.pdf',
        download: 'Lakshay_Kumar_Resume.pdf',
      },
    ],
    along: 72,
    side: 0,
    nodes: [],
  },
]
