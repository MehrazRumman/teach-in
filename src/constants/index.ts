import { i18n } from 'dateformat';

export const dInVietnamese = new Map([
  [i18n.dayNames[1], 'Monday'],
  [i18n.dayNames[2], 'Tuesday'],
  [i18n.dayNames[3], 'Wednesday'],
  [i18n.dayNames[4], 'Thursday'],
  [i18n.dayNames[5], 'Friday'],
  [i18n.dayNames[6], 'Saturday'],
  [i18n.dayNames[0], 'Sunday'],
]);

export const mInVietnamese = Array.from(new Array(12).keys()).map(
  (e) => `Month ${e + 1}`,
);

export const banksCode = ['Bkash', 'Nagad', 'Roket'];

export const PATHS = {
  USER: 'user',
  USER_PROFILE: 'profile',
  LEARNING: 'learning',
  COURSE: 'course',
  PDFS: 'pdf_books',
  BOOK_ORDER: 'book_order_track',
  TEACHING: 'teaching',
  QUESTIONS: 'questions',
  TEST: 'test',
  BOOK: 'book',
  ARTICLE: 'article',
  DASHBOARD: 'dashboard',
  LOGIN: 'login',
  REGISTER: 'register',
  CREATE_COURSE: 'create',
  CREATE_QUESTION: 'create_question',
  CREATE_ARTICLE: 'create_article',
  CREATE_TEST: 'create_test',
  EDIT_COURSE: 'edit',
  EDIT_QUESTION: 'edit_question',
  EDIT_BOOK: 'edit_book',
  CREATE_BOOK: 'create_book',
  EDIT_ARTICLE: 'edit_article',
  EDIT_TEST: 'edit_test',
  ADMIN: 'admin',
  CART: 'cart',
  BROWSE: 'courses',
  PAYMENT_STATUS: 'payment_success',
  MY_LEARNING: 'my-learning',
  INSTRUCTIONS: 'instructions',
  MY_WALLET: 'my-wallet',
  MONEY: 'money',
  EXAM: 'exam',
  MERIT: 'merit',
  BROWSE_EXAM: 'exams',
  BROWSE_CONTEST: 'contests',
  BROWSE_BOOK: 'books',
  BROWSE_ARTICLE: 'articles',
  BROWSE_TUTOR: 'tutors',
};

export const QUERY_FILTERS = {
  SORT: 'sortBy',
  CATEGORY: 'category',
  SECTION: 'section',
  SUB_CATEGORY: 'subCategory',
  OBJECT: 'object',
  PRICE: 'price',
  COURSE_STATE: 'courseState',
};

export const UPLOADER_PB_KEY = process.env.NEXT_PUBLIC_UPLOADER_KEY as string;

export const LEVELS_LABEL = ['Beginner', 'Intermediate', 'Expert', 'All'];

export const MAPPING_PUBLISH_MODE_LANGUAGE = {
  Public: 'PUBLIC',
  Private: 'PRIVATE',
};

export const MAPPING_COURSE_STATE_LANGUAGE = {
  Complete: 'FINALIZATION',
  Accumulate: 'ACCUMULATION',
};

export const MAPPING_QUESTION_STATE_LANGUAGE = {
  Complete: 'FINALIZATION',
  Accumulate: 'ACCUMULATION',
};

export const MAPPING_LEVEL_LANGUAGE = {
  [LEVELS_LABEL[0] as string]: 'BEGINNER',
  [LEVELS_LABEL[1] as string]: 'INTERMEDIATE',
  [LEVELS_LABEL[2] as string]: 'EXPERT',
  [LEVELS_LABEL[3] as string]: 'ALL',
};

export const QUESTION_LEVEL = ['EASY', 'MEDIUM', 'HARD', 'ADVANCED'];

export const webSlogan = 'Teach-In';

export const playerOptions = {
  theme: '#c213ba',
  setting: true,

  autoPlayback: true,

  screenshot: true,
  moreVideoAttr: {
    crossOrigin: '*',
  },

  hotkey: true,

  // fullscreenWeb: true,

  fullscreen: true,

  // pip: true,

  playbackRate: true,

  autoSize: true,
  // autoMini: true,
  // poster:
  //   'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg',
};

export const categories = [
  { title: 'Course', url: `/${PATHS.BROWSE}` },
  { title: 'Exams', url: `/${PATHS.BROWSE_EXAM}` },
  { title: 'Contest', url: `/${PATHS.BROWSE_CONTEST}` },
  { title: 'Notes', url: `/${PATHS.BROWSE_BOOK}` },
  { title: 'Tutors', url: `/${PATHS.BROWSE_TUTOR}` },
  { title: 'Article', url: `/${PATHS.BROWSE_ARTICLE}` },
];

export const swiperBreakPoints = {
  1: {
    slidesPerView: 2,
    spaceBetween: 2,
  },
  320: {
    spaceBetween: 5,
    slidesPerView: 3,
  },
  480: {
    slidesPerView: 4,
  },
  640: {
    slidesPerView: 5,
    spaceBetween: 10,
  },
  1300: {
    spaceBetween: 20,
    slidesPerView: 7,
  },
};

export const MathSection = {
  title: 'Math',
  sections: ['All Part', 'Algebra', 'Arithmetic', 'Geometry', 'Mental Ability'],
};

export const JobPreparation = {
  title: 'Job Preparation',
  fields: [
    'All',
    'Math',
    'General Knowledge',
    'English',
    'Bangla',
    'ICT',
    'Science',
  ],
};
export const SkillDevelopment = {
  title: 'Skill Development',
  fields: [
    'All',
    'Data Structure and Algorithm',
    'Programming Language',
    'Web Development',
    'App Development',
    'Machine Learning',
    'Artificial Intelligence',
    'Data Science',
    'Cloud Computing',
    'Cyber Security',
    'Digital Marketing',
    'Graphic Design',
    'Video Editing',
    'Photography',
    'Music',
    'Writing',
    'Business',
    'Finance',
    'Accounting',
    'Management',
    'Marketing',
    'Human Resource',
    'Entrepreneurship',
    'Leadership',
    'Communication',
    'Presentation',
    'Negotiation',
    'Time Management',
    'Problem Solving',
    'Critical Thinking',
    'Decision Making',
    'Teamwork',
    'Creativity',
    'Emotional Intelligence',
    'Stress Management',
    'Adaptability',
    'Self Confidence',
    'Self Awareness',
    'Self Discipline',
    'Self Motivation',
    'Self Management',
    'Self Development',
    'Self Care',
    'Self Esteem',
    'Self Improvement',
    'Self Help',
    'Self Growth',
    'Self Love',
    'Self Healing',
    'Self Belief',
    'Self Acceptance',
    'Self Worth',
    'Self Respect',
    'Self Image',
    'Self Talk',
    'Self Con',
  ],
};
export const HSC = {
  title: 'HSC',
  fields: [
    'All - HSC',
    'Physics - HSC',
    'Chemistry - HSC',
    'Math - HSC',
    'Higher Math - HSC',
    'ICT - HSC',
    'Biology - HSC',
    'English - HSC',
  ],
};

export const SSC = {
  title: 'SSC',
  fields: [
    'Physics - SSC',
    'Chemistry - SSC',
    'Math - SSC',
    'Higher Math - SSC',
    'ICT - SSC',
    'Biology - SSC',
    'English - SSC',
    'Bangla - SSC',
  ],
};
export const CLASS_8 = {
  title: 'Class 8',
  fields: ['All - 8', 'Math - 8', 'ICT - 8', 'Science - 8', 'English - 8'],
};
export const CLASS_7 = {
  title: 'Class 7',
  fields: ['All - 7', 'Math - 7', 'ICT - 7', 'Science - 7', 'English - 7'],
};
export const CLASS_5 = {
  title: 'Class 5',
  fields: ['All - 5', 'Math - 5', 'Science - 5', 'English - 5'],
};
export const CLASS_6 = {
  title: 'Class 6',
  fields: ['All - 6', 'Math - 6', 'Science - 6', 'English - 6'],
};

export const CLASS_4 = {
  title: 'Class 4',
  fields: ['All - 4', 'Math - 4', 'Science - 4', 'English - 4'],
};

export const categories_detail = [
  SkillDevelopment,
  JobPreparation,
  HSC,
  SSC,
  CLASS_8,
  CLASS_7,
  CLASS_6,
  CLASS_5,
  CLASS_4,
];
