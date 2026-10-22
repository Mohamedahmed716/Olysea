export type Lang = 'en' | 'ar';

export interface ProcessStep {
  title: string;
  short: string;
  detail: string;
  bullets: string[];
}

const en: Record<string, string> = {
  // accessibility labels
  'a.home': 'Olysea home', 'a.main': 'Main', 'a.open': 'Open menu', 'a.close': 'Close menu',
  'a.lang': 'Switch language to Arabic', 'a.prev': 'Previous demo', 'a.next': 'Next demo',
  'a.track': 'Demo websites', 'a.proc': 'Our process',
  // nav
  'n.home': 'Home', 'n.about': 'About', 'n.services': 'Services', 'n.demos': 'Demos', 'n.contact': 'Contact',
  'n.cta': 'Start a Project',
  // hero
  'h.a': 'Your next digital', 'h.b': 'starts here.',
  'h.lead': 'Olysea designs and builds thoughtful digital experiences and software solutions that help businesses move forward.',
  'h.c1': 'Explore Our Work', 'h.c2': "Let's Build Something",
  'ui.r1': 'Booking page for a dental clinic', 'ui.r2': 'Replace paper order forms', 'ui.r3': 'Your idea',
  'ui.s0': 'scoped', 'ui.s1': 'designing', 'ui.s2': 'building', 'ui.s3': 'live',
  // about
  'a.h2': 'Good ideas deserve better digital experiences.',
  'a.lede': 'Olysea combines design, engineering, and practical problem-solving to help businesses improve their online presence and bring ideas to life.',
  'pr1t': 'Purposeful design', 'pr1p': 'Every choice has a reason you can ask about.',
  'pr2t': 'Reliable engineering', 'pr2p': 'Code that is tested, documented and easy to maintain.',
  'pr3t': 'Practical solutions', 'pr3p': 'We solve the problem in front of you first.',
  'pr4t': 'Continuous improvement', 'pr4p': 'Launch is a starting point, not the end.',
  // services
  's.h2': 'What we can build for you.',
  // demos
  'd.h2': "Don't just imagine it. Explore it.",
  'd.lead': 'A collection of digital experiences showing what Olysea can create for different businesses.',
  'd.hint': 'Drag, swipe, or use the arrows. Every demo is a concept project, not a client engagement. Links are placeholders until each demo site is deployed.',
  'd.concept': 'Concept demo', 'd.explore': 'Explore Demo', 'd.empty': 'No projects to show yet.',
  // process
  'p.h2': 'From first idea to something real.',
  // why
  'w.h2': 'One platform. Thoughtful solutions.',
  'w1a': 'Built around ', 'w1b': 'your needs', 'w1p': 'Solutions shaped by real business requirements, not a template we reuse for everyone.',
  'w2a': 'Design with ', 'w2b': 'purpose', 'w2p': 'Every interface and interaction has a reason to exist. If it does not help someone, it goes.',
  'w3a': 'Engineering that ', 'w3b': 'matters', 'w3p': 'Maintainable, reliable software instead of superficial visual polish.',
  'w4a': 'Room to ', 'w4b': 'grow', 'w4p': 'A foundation that can evolve as your business changes.',
  // contact
  'c.h2': "Have an idea? Let's give it a shape.",
  'c.sub': "Tell us what you're trying to build, improve, or simplify. Let's explore what is possible.",
  'c.s1': 'LinkedIn', 'c.s2': 'Instagram',
  'f.name': 'Name', 'f.email': 'Email', 'f.biz': 'Business name', 'f.opt': '(optional)', 'f.type': 'Project type',
  'f.msg': 'Message', 'f.choose': 'Choose one', 'f.send': 'Start a Conversation', 'f.sending': 'Sending…',
  'o1': 'New website', 'o2': 'Custom web application', 'o3': 'Business digitization', 'o4': 'UI/UX design',
  'o5': 'Improve an existing product', 'o6': 'Not sure yet',
  'err.name': 'Enter your name.', 'err.email': 'Enter a valid email address, like name@company.com.',
  'err.type': 'Choose a project type.', 'err.msg': 'Tell us a little more (at least 10 characters).',
  'm.fix': 'Please fix the highlighted fields and try again.',
  'm.ok': 'Thanks. We received your message and will reply by email.',
  'm.err': 'Something went wrong and your message was not sent. Try again, or email hello@olysea.tech.',
  // footer
  'ft.p': 'An independent platform designing and building websites, web applications, and software for growing businesses.',
  'ft.explore': 'Explore', 'ft.hello': 'Say hello', 'ft.rights': 'Olysea. All rights reserved.', 'ft.made': 'Made with intention.',
  // misc
  'load': 'Loading…', 'load.err': 'Could not load content. Showing sample content instead.',
};

const ar: Record<string, string> = {
  'a.home': 'الصفحة الرئيسية لـ Olysea', 'a.main': 'التنقل الرئيسي', 'a.open': 'فتح القائمة', 'a.close': 'إغلاق القائمة',
  'a.lang': 'تغيير اللغة إلى الإنجليزية', 'a.prev': 'النموذج السابق', 'a.next': 'النموذج التالي',
  'a.track': 'مواقع النماذج التجريبية', 'a.proc': 'طريقة عملنا',
  'n.home': 'الرئيسية', 'n.about': 'من نحن', 'n.services': 'خدماتنا', 'n.demos': 'النماذج', 'n.contact': 'تواصل معنا',
  'n.cta': 'ابدأ مشروعك',
  'h.a': 'ابدأ', 'h.b': 'من هنا',
  'h.lead': 'تصمّم Olysea وتبني تجارب رقمية وحلولاً برمجية مدروسة تساعد الأعمال على المضي قدماً.',
  'h.c1': 'استكشف أعمالنا', 'h.c2': 'لنبنِ شيئاً معاً',
  'ui.r1': 'صفحة حجز لعيادة أسنان', 'ui.r2': 'استبدال نماذج الطلبات الورقية', 'ui.r3': 'فكرتك',
  'ui.s0': 'تحديد النطاق', 'ui.s1': 'قيد التصميم', 'ui.s2': 'قيد البناء', 'ui.s3': 'مباشر',
  'a.h2': 'الأفكار الجيدة تستحق تجارب رقمية أفضل.',
  'a.lede': 'تجمع Olysea بين التصميم والهندسة والحلول العملية للمشكلات لمساعدة الشركات على تحسين حضورها على الإنترنت وتحويل أفكارها إلى واقع.',
  'pr1t': 'تصميم هادف', 'pr1p': 'لكل قرار سبب يمكنك أن تسأل عنه.',
  'pr2t': 'هندسة موثوقة', 'pr2p': 'شيفرة مختبَرة وموثّقة وسهلة الصيانة.',
  'pr3t': 'حلول عملية', 'pr3p': 'نبدأ بحل المشكلة التي أمامك أولاً.',
  'pr4t': 'تحسين مستمر', 'pr4p': 'الإطلاق نقطة بداية وليس نهاية.',
  's.h2': 'ما يمكننا بناؤه لك.',
  'd.h2': 'لا تكتفِ بتخيّل الفكرة، بل استكشفها.',
  'd.lead': 'مجموعة من التجارب الرقمية توضّح ما يمكن لـ Olysea إنشاؤه لمختلف أنواع الأعمال.',
  'd.hint': 'اسحب أو مرّر بإصبعك أو استخدم الأسهم. كل نموذج هو مشروع تصوّري وليس عملاً لعميل. الروابط مؤقتة إلى حين نشر كل موقع تجريبي.',
  'd.concept': 'نموذج تصوّري', 'd.explore': 'استكشف النموذج', 'd.empty': 'لا توجد مشاريع لعرضها بعد.',
  'p.h2': 'من الفكرة الأولى إلى شيء حقيقي.',
  'w.h2': 'منصة واحدة. حلول مدروسة.',
  'w1a': 'مصمّمة حول ', 'w1b': 'احتياجاتك', 'w1p': 'حلول تتشكل وفق متطلبات العمل الحقيقية، لا قالباً نعيد استخدامه مع الجميع.',
  'w2a': 'تصميم له ', 'w2b': 'هدف', 'w2p': 'لكل واجهة ولكل تفاعل سبب لوجوده. وما لا يفيد أحداً نحذفه.',
  'w3a': 'هندسة ', 'w3b': 'ذات قيمة', 'w3p': 'برمجيات موثوقة سهلة الصيانة بدلاً من لمسات شكلية سطحية.',
  'w4a': 'مساحة ', 'w4b': 'للنمو', 'w4p': 'أساس يتطور مع تغيّر عملك.',
  'c.h2': 'لديك فكرة؟ لنمنحها شكلاً.',
  'c.sub': 'أخبرنا بما تحاول بناءه أو تحسينه أو تبسيطه. لنستكشف معاً ما هو ممكن.',
  'c.s1': 'LinkedIn', 'c.s2': 'Instagram',
  'f.name': 'الاسم', 'f.email': 'البريد الإلكتروني', 'f.biz': 'اسم النشاط التجاري', 'f.opt': '(اختياري)',
  'f.type': 'نوع المشروع', 'f.msg': 'الرسالة', 'f.choose': 'اختر واحداً', 'f.send': 'ابدأ المحادثة', 'f.sending': 'جارٍ الإرسال…',
  'o1': 'موقع إلكتروني جديد', 'o2': 'تطبيق ويب مخصص', 'o3': 'رقمنة الأعمال', 'o4': 'تصميم UI/UX',
  'o5': 'تحسين منتج قائم', 'o6': 'لست متأكداً بعد',
  'err.name': 'أدخل اسمك.', 'err.email': 'أدخل بريداً إلكترونياً صحيحاً، مثل name@company.com.',
  'err.type': 'اختر نوع المشروع.', 'err.msg': 'أخبرنا بالمزيد (10 أحرف على الأقل).',
  'm.fix': 'يرجى تصحيح الحقول المظللة والمحاولة مرة أخرى.',
  'm.ok': 'شكراً لك. استلمنا رسالتك وسنرد عليك عبر البريد الإلكتروني.',
  'm.err': 'حدث خطأ ولم تُرسل رسالتك. حاول مرة أخرى، أو راسلنا على hello@olysea.tech.',
  'ft.p': 'منصة مستقلة تصمم وتبني المواقع وتطبيقات الويب والبرمجيات للأعمال النامية.',
  'ft.explore': 'استكشف', 'ft.hello': 'قل مرحباً', 'ft.rights': 'Olysea. جميع الحقوق محفوظة.', 'ft.made': 'صُنع بعناية وقصد',
  'load': 'جارٍ التحميل…', 'load.err': 'تعذّر تحميل المحتوى. نعرض محتوى تجريبياً بدلاً منه.',
};

export const TX: Record<Lang, Record<string, string>> = { en, ar };

export const SWAP: Record<Lang, string[]> = {
  en: ['idea', 'website', 'product', 'brand', 'tool'],
  ar: ['فكرتك', 'موقعك', 'منتجك', 'علامتك', 'أداتك'],
};

export const MARQUEE: Record<Lang, string[]> = {
  en: ['Websites', 'Web apps', 'Business digitization', 'UI/UX', 'Ongoing improvements'],
  ar: ['مواقع إلكترونية', 'تطبيقات الويب', 'رقمنة الأعمال', 'UI/UX', 'تحسينات مستمرة'],
};

export const STEPS: Record<Lang, ProcessStep[]> = {
  en: [
    { title: 'Discover', short: 'Understand the business, goals, audience, and problem.',
      detail: 'We start with a conversation: what the business does, who it serves, and what is not working today.',
      bullets: ['Goals and audience, written down', 'A clear problem statement', 'Questions answered before design starts'] },
    { title: 'Define', short: 'Establish requirements, scope, priorities, and the proposed solution.',
      detail: 'We turn what we learned into a plan you can read in one sitting.',
      bullets: ['Scope and priorities', 'Proposed solution and structure', 'What is in now, and what can wait'] },
    { title: 'Build', short: 'Design, develop, test, and refine the product.',
      detail: 'Design and development happen together, and you see working progress along the way.',
      bullets: ['Design and working prototypes', 'Tested, documented code', 'Regular reviews with you'] },
    { title: 'Improve', short: 'Deploy, monitor, and improve the experience over time.',
      detail: 'After launch we watch how the product is used and keep refining it.',
      bullets: ['Deployment and monitoring', 'Fixes and updates', 'New features as the business grows'] },
  ],
  ar: [
    { title: 'الاكتشاف', short: 'نفهم طبيعة العمل والأهداف والجمهور والمشكلة.',
      detail: 'نبدأ بحوار: ماذا يفعل العمل، ومن يخدم، وما الذي لا يعمل جيداً اليوم.',
      bullets: ['الأهداف والجمهور مكتوبة بوضوح', 'بيان واضح للمشكلة', 'إجابات عن الأسئلة قبل بدء التصميم'] },
    { title: 'التحديد', short: 'نحدد المتطلبات والنطاق والأولويات والحل المقترح.',
      detail: 'نحوّل ما تعلمناه إلى خطة يمكنك قراءتها في جلسة واحدة.',
      bullets: ['النطاق والأولويات', 'الحل المقترح وهيكله', 'ما يدخل الآن وما يمكن تأجيله'] },
    { title: 'البناء', short: 'نصمم المنتج ونطوره ونختبره ونحسّنه.',
      detail: 'يسير التصميم والتطوير معاً، وترى التقدم الفعلي أولاً بأول.',
      bullets: ['تصميم ونماذج أولية تعمل', 'شيفرة مختبَرة وموثّقة', 'مراجعات دورية معك'] },
    { title: 'التحسين', short: 'نطلق المنتج ونراقبه ونحسّن التجربة مع الوقت.',
      detail: 'بعد الإطلاق نراقب كيفية استخدام المنتج ونواصل تحسينه.',
      bullets: ['النشر والمراقبة', 'إصلاحات وتحديثات', 'ميزات جديدة مع نمو العمل'] },
  ],
};
