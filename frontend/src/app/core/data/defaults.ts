import { Project } from '../models/project.model';
import { Service } from '../models/service.model';

export const SITE = {
  name: 'Olysea',
  email: 'hello@olysea.tech',
  linkedin: '#',
  instagram: '#',
};

/**
 * Starter content. The public site falls back to these when the API is unreachable,
 * and the admin area can import them into an empty database with one click.
 */
export const DEFAULT_SERVICES: Service[] = [
  {
    title: 'Website Design & Development',
    description:
      'Professional, responsive websites that represent your business and turn visitors into customers.',
    extra: 'Includes content structure, build, and launch support.',
    titleAr: 'تصميم المواقع وتطويرها',
    descriptionAr: 'مواقع احترافية متجاوبة تمثّل عملك وتحوّل الزوار إلى عملاء.',
    extraAr: 'تشمل هيكلة المحتوى والبناء ودعم الإطلاق.',
  },
  {
    title: 'Custom Web Applications',
    description: 'Interactive applications designed around your specific business needs and workflows.',
    extra: 'Dashboards, portals, booking and internal tools.',
    titleAr: 'تطبيقات ويب مخصصة',
    descriptionAr: 'تطبيقات تفاعلية مصمّمة حول احتياجات عملك وسير عمله.',
    extraAr: 'لوحات تحكم وبوابات وأنظمة حجز وأدوات داخلية.',
  },
  {
    title: 'Business Digitization',
    description: 'Replace repetitive manual processes with digital tools your team will actually use.',
    extra: 'Forms, spreadsheets and paperwork, made simple.',
    titleAr: 'رقمنة الأعمال',
    descriptionAr: 'استبدل العمليات اليدوية المتكررة بأدوات رقمية سيستخدمها فريقك فعلاً.',
    extraAr: 'النماذج والجداول والأوراق، بكل بساطة.',
  },
  {
    title: 'UI/UX & Digital Experiences',
    description: 'Thoughtful interfaces that make digital products clearer and easier to use.',
    extra: 'Research, wireframes, prototypes and design systems.',
    titleAr: 'تصميم الواجهات وتجربة المستخدم',
    descriptionAr: 'واجهات مدروسة تجعل المنتجات الرقمية أوضح وأسهل استخداماً.',
    extraAr: 'بحث ومخططات هيكلية ونماذج أولية وأنظمة تصميم.',
  },
  {
    title: 'Ongoing Improvements',
    description: 'Maintaining, refining, and extending your digital products as the business grows.',
    extra: 'Updates, fixes and new features, on your schedule.',
    titleAr: 'تحسينات مستمرة',
    descriptionAr: 'صيانة منتجاتك الرقمية وتحسينها وتوسيعها مع نمو عملك.',
    extraAr: 'تحديثات وإصلاحات وميزات جديدة، وفق جدولك.',
  },
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    category: 'Fitness Center',
    name: 'Ironclad Athletics',
    description: 'Membership tiers, a live class timetable, and bold training photography.',
    url: 'https://demo-fitness.olysea.tech',
    previewKey: 'fitness',
    categoryAr: 'مركز لياقة',
    descriptionAr: 'باقات اشتراك، وجدول حصص مباشر، وصور تدريب جريئة.',
  },
  {
    category: 'Restaurant',
    name: 'Casa Marea',
    description: 'An editorial menu, seasonal dishes, and a one-tap reservation call to action.',
    url: 'https://demo-restaurant.olysea.tech',
    previewKey: 'restaurant',
    categoryAr: 'مطعم',
    descriptionAr: 'قائمة طعام بتصميم تحريري، وأطباق موسمية، وزر حجز بلمسة واحدة.',
  },
  {
    category: 'Medical Clinic',
    name: 'Northgate Family Clinic',
    description: 'Doctor profiles, opening hours, and appointment booking that is easy to find.',
    url: 'https://demo-clinic.olysea.tech',
    previewKey: 'clinic',
    categoryAr: 'عيادة طبية',
    descriptionAr: 'ملفات تعريفية للأطباء، وساعات العمل، وحجز مواعيد يسهل العثور عليه.',
  },
  {
    category: 'Real Estate',
    name: 'Meridian Properties',
    description: 'A refined listings showcase with large imagery and clear property details.',
    url: 'https://demo-realestate.olysea.tech',
    previewKey: 'realestate',
    categoryAr: 'عقارات',
    descriptionAr: 'عرض أنيق للعقارات بصور كبيرة وتفاصيل واضحة لكل عقار.',
  },
  {
    category: 'Training Academy',
    name: 'Brightpath Academy',
    description: 'Course catalog, instructor profiles, and a clear enrollment path.',
    url: 'https://demo-academy.olysea.tech',
    previewKey: 'academy',
    categoryAr: 'أكاديمية تدريب',
    descriptionAr: 'دليل الدورات، وملفات المدربين، ومسار تسجيل واضح.',
  },
  {
    category: 'Auto Detailing',
    name: 'Apex Detail Co.',
    description: 'Service packages with a before-and-after slider for finish quality.',
    url: 'https://demo-detailing.olysea.tech',
    previewKey: 'detailing',
    categoryAr: 'العناية بالسيارات',
    descriptionAr: 'باقات خدمات مع شريط «قبل وبعد» لإبراز جودة التلميع.',
  },
];
