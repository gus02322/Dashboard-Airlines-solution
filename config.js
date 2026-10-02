/**
 * OpsRamp website configuration
 * ------------------------------------------------------------
 * This is the ONLY file you need to edit to change text, prices,
 * links and contact details. After editing, run:
 *
 *     node build.mjs
 *
 * and the site is regenerated in /dist. (Netlify does this for you
 * automatically on every push.)
 *
 * Writing rules used across the copy: short sentences, no em dashes,
 * no invented statistics, no customer names.
 */

export default {
  /* ---------- Site & SEO ---------- */
  site: {
    name: 'OpsRamp',
    // Final public URL, no trailing slash. Used for canonical links,
    // social previews (LinkedIn needs absolute URLs) and the sitemap.
    // Currently: GitHub Pages. Replace with your own domain later.
    url: 'https://gus02322.github.io/Dashboard-Airlines-solution',
    title: 'OpsRamp | Live operations board for airline catering',
    description:
      'A real-time board for airline catering: ETA, sealing, truck departure and ETD on one screen. Fed by a Google Sheet. Live in under a day.',
    language: 'en',
    year: 2026,
  },

  /* ---------- Contact & form ---------- */
  contact: {
    email: 'augustin@de-franssu.com',
    linkedin: 'https://www.linkedin.com/in/YOUR-PROFILE', // TODO: replace
    // Form provider:
    //  'mailto'    opens the visitor's email app, pre-filled (works anywhere, no account)
    //  'netlify'   Netlify Forms (only when the site is hosted on Netlify)
    //  'formspree' paste your Formspree endpoint below (works on GitHub Pages)
    formProvider: 'mailto',
    formspreeEndpoint: 'https://formspree.io/f/YOUR_FORM_ID', // only used with 'formspree'
  },

  /* ---------- Navigation ---------- */
  nav: [
    { label: 'Demo', href: '#demo' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  navCta: 'Book a demo',

  /* ---------- 1. Hero ---------- */
  hero: {
    eyebrow: 'Live operations board for airline catering',
    title: ['Every flight.', 'Every milestone.', 'One screen.'],
    subtitle:
      'OpsRamp turns the Google Sheet you already use into a live board for ETA, sealing, truck departure and ETD. The kitchen, the dispatch desk and the ramp all see the same clock.',
    primaryCta: 'Book a demo',
    secondaryCta: 'Try the live demo',
  },

  /* Real figures only. Edit when they change. */
  proofStrip: [
    { value: '~50', label: 'daily users' },
    { value: 'Multi-site', label: 'one board, several locations' },
    { value: '4', label: 'milestones tracked per flight' },
    { value: 'Live', label: 'at a major international hub' },
  ],

  /* ---------- 2. Problem ---------- */
  problem: {
    eyebrow: 'The problem',
    title: 'Today, the ramp runs on group chats.',
    items: [
      {
        icon: 'sheet',
        title: 'The plan lives in a spreadsheet',
        text: 'Someone updated it at 6am. Nobody on the floor has opened it since.',
      },
      {
        icon: 'chat',
        title: 'Changes travel by WhatsApp and radio',
        text: 'A new ETA lands in one chat, the truck driver reads another.',
      },
      {
        icon: 'truck',
        title: 'A truck leaves 20 minutes off',
        text: 'Too early, the meals wait on the tarmac. Too late, the aircraft waits for you.',
      },
    ],
  },

  /* ---------- 3. Live demo ---------- */
  demo: {
    eyebrow: 'Interactive demo',
    title: "Don't take our word for it. Run the board.",
    subtitle:
      'Click a flight, filter by milestone, trigger a sealing alert or switch to the TV view. Sample data, fictional hub.',
    note: 'Sample schedule. Flight numbers and times are fictional.',
  },

  /* ---------- 4. Features (max 6) ---------- */
  features: {
    eyebrow: 'Why teams switch',
    title: 'What changes on day one',
    items: [
      { icon: 'timeline', title: 'The whole day at a glance', text: 'Every ETA, sealing, truck and ETD on one live timeline. The NOW line shows exactly where you are.' },
      { icon: 'bell', title: 'Late becomes rare', text: 'A full-screen alert with sound 15 minutes before every sealing and truck departure. Nobody has to remember.' },
      { icon: 'tv', title: 'Readable from across the kitchen', text: 'A TV view built for factory screens. Big type, high contrast, no clicking.' },
      { icon: 'phone', title: 'Supervisors stay in the loop', text: 'The same board on any phone, laid out as a simple list. No app to install.' },
      { icon: 'spark', title: 'Ask the board a question', text: 'The AI Copilot knows today\'s flights. Ask what leaves next or how many halal meals are due.' },
      { icon: 'grid', title: 'Edit a cell, everyone sees it', text: 'Your schedule stays in Google Sheets. Change a time, the board updates for the whole team.' },
    ],
  },

  /* ---------- 5. AI Copilot ---------- */
  copilot: {
    eyebrow: 'AI Copilot',
    title: 'Ask in plain English. Get the answer from today\'s schedule.',
    text: 'The Copilot reads the same data as the board. No searching, no scrolling, no calling the office.',
    disclaimer: 'Demo answers are generated from the sample schedule above.',
    // Answers are computed live from the demo data; the questions are editable.
    questions: [
      'What leaves in the next 2 hours?',
      'Which flights are at risk?',
      'How many Halal meals today?',
    ],
  },

  /* ---------- 6. How it works ---------- */
  howItWorks: {
    eyebrow: 'How it works',
    title: 'Live in under 1 day. No IT project.',
    steps: [
      { title: 'Connect your sheet', text: 'Keep your existing Google Sheet. We map your columns once: flight, airline, times, days.' },
      { title: 'Open the link', text: 'One secure link for the office, the kitchen TV and every supervisor phone.' },
      { title: 'Your team is live', text: 'The board updates itself. Alerts start firing the same day.' },
    ],
  },

  /* ---------- 7. ROI calculator ---------- */
  roi: {
    eyebrow: 'Your numbers',
    title: 'What is one late truck worth to you?',
    text: 'Use your own numbers. This is an estimate, not a promise.',
    defaults: {
      flightsPerDay: 30,
      incidentsPerMonth: 6,
      costPerIncident: 800, // in currency below
      avoidablePct: 25,     // share of incidents a live board could help avoid
    },
    currency: '$',
    disclaimer:
      'Estimate only. The avoidable share is an assumption you control. OpsRamp does not guarantee a specific reduction.',
  },

  /* ---------- 8. Comparison ---------- */
  comparison: {
    eyebrow: 'Comparison',
    title: 'Where OpsRamp fits',
    columns: ['Spreadsheets + WhatsApp', 'OpsRamp', 'Enterprise suites'],
    rows: [
      { label: 'Price', values: ['Free', 'Monthly subscription', 'Large licence, often per site'] },
      { label: 'Time to go live', values: ['Already there', 'Under 1 day', 'Weeks to months'] },
      { label: 'Training', values: ['None, but no live view', 'None needed', 'Formal training'] },
      { label: 'Mobile and TV', values: ['Phone only, no alerts', 'Both, with alerts', 'Varies by module'] },
      { label: 'Fits a small team', values: ['Yes', 'Yes', 'Built for large operations'] },
    ],
  },

  /* ---------- 9. Pricing ---------- */
  pricing: {
    eyebrow: 'Pricing',
    subtitle: 'No setup project, no long contract. Prices exclude taxes.',
    title: 'Simple pricing',
    // While true, each price shows an "Example price" tag. Set to false
    // once you have entered your real prices.
    showExampleTag: true,
    plans: [
      {
        name: 'Starter',
        price: '$290',
        period: '/ month',
        tagline: 'One site, one kitchen.',
        features: ['1 location', 'Live board, mobile and TV views', 'Sealing and truck alerts', 'Email support'],
        cta: 'Book a demo',
        highlighted: false,
      },
      {
        name: 'Operations',
        price: '$690',
        period: '/ month',
        tagline: 'For busy hubs with several teams.',
        features: ['Up to 3 locations', 'Everything in Starter', 'AI Copilot', 'Production and week views', 'Priority support'],
        cta: 'Book a demo',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        tagline: 'Multi-country, custom integrations.',
        features: ['Unlimited locations', 'Custom data sources', 'Onboarding on site', 'Dedicated contact'],
        cta: 'Talk to us',
        highlighted: false,
      },
    ],
  },

  /* ---------- 10. Proof ---------- */
  proof: {
    eyebrow: 'In production',
    title: 'Built on the ramp, not in a boardroom.',
    text: 'Built by an airline catering operations manager. Used daily at a major international hub.',
    stats: [
      { value: '~50', label: 'daily users' },
      { value: 'Multi-site', label: 'several locations on one board' },
      { value: '4', label: 'event types tracked per flight' },
    ],
    // Add real testimonials here when you have written permission.
    // Leave the array empty to hide the block.
    // Example: { quote: '...', name: 'Jane Doe', role: 'Unit Director', company: 'Company' }
    testimonials: [],
  },

  /* ---------- 11. FAQ ---------- */
  faq: {
    eyebrow: 'FAQ',
    title: 'Questions operators ask',
    items: [
      { q: 'Is our schedule data secure?', a: 'Your data stays in your own Google Sheet, under your Google account permissions. OpsRamp only reads the published schedule. No passenger data is needed.' },
      { q: 'Where is it hosted?', a: 'OpsRamp is a web app served over HTTPS from a global CDN. Nothing to install on your servers. Private hosting can be discussed on the Enterprise plan.' },
      { q: 'Can we adapt it to our operation?', a: 'Yes. Airlines, colours, alert timing, meal types and views are configured for your site during setup.' },
      { q: 'What support do we get?', a: 'Email support on every plan, with priority response on Operations. Setup is done with you, not handed over as a manual.' },
      { q: 'Does it integrate with our systems?', a: 'It starts from a Google Sheet, which any system can export to. Direct connections to other data sources are available on Enterprise.' },
      { q: 'Can we try it first?', a: 'Yes. Book a demo and we can set up a trial on your own schedule so your team sees real flights.' },
    ],
  },

  /* ---------- 12. Final CTA & form ---------- */
  cta: {
    eyebrow: 'Book a demo',
    title: 'See your own operation on it.',
    text: 'Send us a few lines. We reply within one working day with a demo slot.',
    sizes: ['Under 20 flights / day', '20 to 50 flights / day', '50 to 100 flights / day', 'More than 100 flights / day'],
    submit: 'Request a demo',
    success: 'Thank you. Your request is in. We will reply within one working day.',
    error: 'Sending failed. Your email app will open with the message ready to send.',
  },

  /* ---------- 13. Footer ---------- */
  footer: {
    tagline: 'Live operations board for airline catering.',
    legal: 'OpsRamp is an independent product. Airline names in the demo are used for illustration only; no affiliation is implied.',
  },

  /* ---------- /demo share page ---------- */
  demoPage: {
    title: 'OpsRamp live demo | Airline catering operations board',
    description: 'Try the OpsRamp board: live timeline, alerts, airline and production views, TV mode. Sample data.',
  },
};
