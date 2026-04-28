// Site content — edit this file with your own details.
// Everything the renderer consumes lives here; no changes to v8_gallery.js are
// needed unless you want to restructure the layout.
window.JASON = {
  // The h1 renders this string verbatim — wrap a nickname or initial in <em>
  // to pick up the accent color (see .vF .plate h1 em in v8_gallery.js).
  name: 'Jane <em>Q.</em> Example',
  shortName: 'Jane Example',
  email: 'jane.example@your-institution.edu',
  phone: '',
  location: 'City, ST',
  role: 'PhD Candidate in [Field]',
  lab: 'Example Lab',
  advisor: 'Prof. Advisor Name',
  institution: 'Example University',
  // ISO date (YYYY-MM-DD) the site went live — drives the "Day N" counter in
  // the Site Stats panel. The Worker falls back to SITE_LIVE_DATE in
  // worker/index.js if this is empty or missing.
  liveSince: '2025-01-01',
  links: {
    email: 'mailto:jane.example@your-institution.edu',
    github: 'https://github.com/your-github-handle',
    linkedin: 'https://www.linkedin.com/in/your-linkedin-handle',
    scholar: 'https://scholar.google.com/citations?user=YOUR_ID',
    greco: 'https://your-lab.example.org/',
    cv: 'assets/your-cv.pdf',
  },
  // Path to the headshot image. Defaults to assets/headshot.jpg if omitted.
  // The bundled placeholder is an SVG silhouette — replace with your own image
  // in any format (jpg/png/webp/svg) and update the path here.
  headshot: 'assets/headshot.svg',
  // The short bio on the left. Phrases matching the .replace() strings in
  // v8_gallery.js (see `bioHtml`) are wrapped in accent-color <b>.
  bio: `One sentence of what you do, naming the two or three concepts you want accented — you can adjust which phrases get highlighted in scripts/v8_gallery.js.`,
  long: `A longer paragraph for an about page or blog intro — optional.`,
  long2: `A second paragraph if you want a training-history section — optional.`,
  interests: [
    { title: 'Area 1', sub: 'sub · line · here' },
    { title: 'Area 2', sub: 'sub · line · here' },
    { title: 'Area 3', sub: 'sub · line · here' },
  ],
  pubs: [
    {
      year: 2024, venue: 'Journal Name',
      title: 'First publication title',
      authors: '<b>Example J</b>, Second A, Third B, Senior C',
      blurb: 'One-sentence summary of the finding, verbatim quote from the abstract, or a significance statement.',
      teaser: 'diagram',
      link: 'https://doi.org/10.xxxx/example1',
    },
    {
      year: 2022, venue: 'Journal Name',
      title: 'Second publication title',
      authors: 'First A, <b>Example J</b>, Second B, Senior C',
      blurb: 'One-sentence summary of the finding.',
      teaser: 'network',
      link: 'https://doi.org/10.xxxx/example2',
    },
    {
      year: 2020, venue: 'Journal Name',
      title: 'Third publication title',
      authors: '<b>Example J</b>, Second A, Third B, Senior C',
      blurb: 'One-sentence summary of the finding.',
      teaser: 'curves',
      link: 'https://doi.org/10.xxxx/example3',
    },
  ],
  education: [
    { year: '20XX — present', what: 'PhD, Field',             where: 'University', detail: 'City, ST' },
    { year: '20XX – 20XX',    what: "M.S. / M.Eng. Field",   where: 'University', detail: 'City, ST' },
    { year: '20XX – 20XX',    what: 'B.S. Field',             where: 'University', detail: 'City, ST' },
  ],
  experience: [
    { year: '20XX —',      what: 'Current role',       where: 'Workplace', detail: 'What you do here, in one sentence.' },
    { year: '20XX – 20XX', what: 'Prior role',         where: 'Workplace', detail: 'What you did there, in one sentence.' },
  ],
  talks: [
    { year: 2024, what: 'Conference name',             note: 'Talk' },
    { year: 2023, what: 'Another conference / seminar', note: 'Poster' },
  ],
  skills: [
    'Skill 1',
    'Skill 2',
    'Skill 3',
    'Skill 4',
    'Skill 5',
    'Skill 6',
    'Skill 7',
    'Skill 8',
  ],
  // Three current research questions for the homepage's "Current research"
  // section. Each entry renders as a card with a kind tag, a question, a
  // blurb, and a `teaser` key resolved against scripts/teaser.js. Add or
  // remove entries to taste — the renderer adapts.
  research: [
    {
      kind: 'Theme 1',
      title: 'A first research question — what are you asking right now?',
      blurb: 'One paragraph framing the motivation, the approach, and what answering this would change. Aim for 2–4 sentences. The card is mostly text, so no need for a punchline format.',
      teaser: 'diagram',
    },
    {
      kind: 'Theme 2',
      title: 'A second research question, ideally a different angle.',
      blurb: 'Another paragraph at the same length and register. If you want a different visual register from your publications, add new keys to scripts/teaser.js and reference them here.',
      teaser: 'network',
    },
    {
      kind: 'Theme 3',
      title: 'A third research question to round out the set.',
      blurb: 'Three cards reads as a deliberate set; two reads as paired; one reads as a feature. The grid layout in v8_gallery.js will adapt.',
      teaser: 'curves',
    },
  ],
};
