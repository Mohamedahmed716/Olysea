import { TestBed } from '@angular/core/testing';
import { Toast } from './toast';

describe('Toast service', () => {
  let toast: Toast;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Toast],
    });
    toast = TestBed.inject(Toast);
  });

  it('starts with an empty toast list', () => {
    expect(toast.items().length).toBe(0);
  });

  it('ok() pushes a success toast item', () => {
    toast.ok('Saved successfully', 'Your changes have been saved.');
    const items = toast.items();

    expect(items.length).toBe(1);
    expect(items[0].kind).toBe('ok');
    expect(items[0].title).toBe('Saved successfully');
    expect(items[0].message).toBe('Your changes have been saved.');
  });

  it('bad() pushes an error toast item', () => {
    toast.bad('Error occurred', 'Action could not be completed.');
    const items = toast.items();

    expect(items.length).toBe(1);
    expect(items[0].kind).toBe('bad');
    expect(items[0].title).toBe('Error occurred');
  });

  it('dismiss marks toast as leaving', () => {
    toast.ok('Notification');
    const id = toast.items()[0].id;

    toast.dismiss(id);
    expect(toast.items()[0].leaving).toBe(true);
  });
});
