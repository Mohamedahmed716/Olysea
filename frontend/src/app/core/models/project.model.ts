export interface Project {
  id?: number;
  category: string;
  name: string;
  description: string;
  /** Link to the live demo. */
  url: string;
  /** Screenshot (data URL or https URL). Takes priority over previewKey. */
  image?: string | null;
  /** Key of a built-in illustrated preview (see core/data/previews.ts). */
  previewKey?: string | null;
  categoryAr?: string | null;
  descriptionAr?: string | null;
}

export type ProjectInput = Omit<Project, 'id'>;
