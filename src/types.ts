export type TemplateCategory = "daily" | "occasion";

export interface GreetingTemplate {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: TemplateCategory;
  dayOfWeek?: number;
  occasionKey?: string;
  tags?: string[];
  altText: string;
  isActive: boolean;
  sortOrder: number;
}
