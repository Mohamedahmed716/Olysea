export type ContactStatus = 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';

export const CONTACT_STATUSES: ContactStatus[] = ['NEW', 'READ', 'REPLIED', 'ARCHIVED'];

/** Project types offered in the contact form. `value` is what is sent to the server (always English). */
export const CONTACT_TYPES: { value: string; key: string }[] = [
  { value: 'New website', key: 'o1' },
  { value: 'Custom web application', key: 'o2' },
  { value: 'Business digitization', key: 'o3' },
  { value: 'UI/UX design', key: 'o4' },
  { value: 'Improve an existing product', key: 'o5' },
  { value: 'Not sure yet', key: 'o6' },
];

export interface ContactPayload {
  name: string;
  email: string;
  business?: string;
  type: string;
  message: string;
}

export interface ContactRequest extends ContactPayload {
  id?: number;
  status?: ContactStatus;
  createdAt?: string;
}
