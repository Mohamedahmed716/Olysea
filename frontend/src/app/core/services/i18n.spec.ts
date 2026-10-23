import { TestBed } from '@angular/core/testing';
import { I18n } from './i18n';

describe('I18n service', () => {
  let i18n: I18n;

  beforeEach(() => {
    localStorage.removeItem('olysea-lang');
    TestBed.configureTestingModule({
      providers: [I18n],
    });
    i18n = TestBed.inject(I18n);
  });

  afterEach(() => {
    localStorage.removeItem('olysea-lang');
  });

  it('initializes with default language en', () => {
    expect(i18n.lang()).toBe('en');
    expect(i18n.isAr()).toBe(false);
  });

  it('translates known keys in English', () => {
    const translation = i18n.t('n.home');
    expect(translation).toBe('Home');
  });

  it('toggle switches language to Arabic and back to English', () => {
    i18n.toggle();
    expect(i18n.lang()).toBe('ar');
    expect(i18n.isAr()).toBe(true);

    i18n.toggle();
    expect(i18n.lang()).toBe('en');
    expect(i18n.isAr()).toBe(false);
  });

  it('pick selects Arabic text when language is Arabic', () => {
    i18n.lang.set('en');
    expect(i18n.pick('English Text', 'نص عربي')).toBe('English Text');

    i18n.lang.set('ar');
    expect(i18n.pick('English Text', 'نص عربي')).toBe('نص عربي');
  });

  it('pick falls back to English when Arabic is null or missing', () => {
    i18n.lang.set('ar');
    expect(i18n.pick('English Text', null)).toBe('English Text');
    expect(i18n.pick('English Text', undefined)).toBe('English Text');
  });
});
