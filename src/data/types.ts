export type TextBlock = {
  type: "text";
  heading?: string;
  body: string;
};

export type ImageBlock = {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
};

export type GalleryBlock = {
  type: "gallery";
  images: { src: string; alt: string; caption?: string }[];
};

export type QuoteBlock = {
  type: "quote";
  text: string;
  author: string;
  role?: string;
};

export type ListBlock = {
  type: "list";
  items: { label: string; text?: string }[];
};

export type VideoBlock = {
  type: "video";
  src: string;
  poster?: string;
  caption?: string;
};

export type NdaBlock = {
  type: "nda";
  body: string;
};

export type Block =
  | TextBlock
  | ImageBlock
  | GalleryBlock
  | QuoteBlock
  | ListBlock
  | VideoBlock
  | NdaBlock;

export type CasePoint = {
  title: string;
  text: string;
};

export type CaseSlide = {
  src: string;
  fit?: "cover" | "contain";
  align?: "left" | "center";
};

export type CaseFigure = {
  src: string;
  alt: string;
  slides?: Array<string | CaseSlide>;
  fit?: "cover" | "contain";
};

export type CaseInsight = {
  heading: string;
  paragraphs?: string[];
  points?: CasePoint[];
  figure?: CaseFigure;
};

export type Section = {
  id: string;
  nav: string;
  kicker: string;
  heading?: string;
  paragraphs: string[];
  insights: CaseInsight[];
  hidden?: boolean;
};

export type ProjectMeta = {
  role: string;
  timeline: string;
  team: string;
  platform: string;
};

export type Project = {
  slug: string;
  title: string;
  client: string;
  year: string;
  cover: string;
  screens: string[];
  span?: "full";
  summary: string;
  hero: { screen: string; overlay?: string; phone?: string };
  brief: { title: string; text: string; items?: CasePoint[] };
  meta: ProjectMeta;
  websiteLabel?: string;
  websiteUrl?: string;
  sections: Section[];
};

export type NavItem = {
  label: string;
  to: "/" | "/experiments" | "/about" | "/resume";
};

export type SocialLink = {
  label: string;
  icon: string;
  href: string;
};

export type SiteContent = {
  profile: {
    name: string;
    summary: string;
    avatar: string;
    email: string;
    scheduleUrl: string;
    tagline: string;
    wordmark: string;
    copyright: string;
    social: SocialLink[];
  };
  ui: {
    nav: NavItem[];
    switchTo: string;
    latestWork: string;
    letsChat: string;
    copied: string;
    schedule: string;
    linksTitle: string;
    contactTitle: string;
    exploreMore: string;
    menuOpen: string;
    menuClose: string;
    metaLabels: ProjectMeta;
    notFound: string;
    backHome: string;
  };
  experiments: { title: string; src: string; alt: string }[];
  about: {
    portrait: string;
    portraitAlt: string;
    heading: string;
    headingMuted: string;
    paragraphs: string[];
    interestsTitle: string;
    interestsMuted: string;
    interests: { label: string; icon: string }[];
    valuesTitle: string;
    valuesMuted: string;
    values: { title: string; body: string }[];
    pathTitle: string;
    pathMuted: string;
    path: { src: string; alt: string; caption: string }[];
  };
  resume: {
    jobs: {
      role: string;
      company: string;
      dates: string;
      location: string;
      body: string;
      icon?: string;
    }[];
    toolsTitle: string;
    toolsMuted: string;
    tools: { name: string; detail: string; icon?: string; iconCrop?: boolean }[];
    skillsTitle: string;
    skills: string[];
    educationTitle: string;
    education: { title: string; dates: string; location: string; lines: string[] }[];
  };
  projects: Project[];
};
