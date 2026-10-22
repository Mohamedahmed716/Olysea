export interface Service {
  id?: number;
  title: string;
  description: string;
  extra?: string | null;
  titleAr?: string | null;
  descriptionAr?: string | null;
  extraAr?: string | null;
}

export type ServiceInput = Omit<Service, 'id'>;
