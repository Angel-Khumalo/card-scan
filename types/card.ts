// types/Card.ts
export interface Card {
  id: string;
  title: string;      // e.g. "Emeris Student Card"
  number: string;      // full number, stored encrypted at rest
  holder: string;
  expiry: string;       // MM/YY
  rawData?: string;     // raw OCR/scan payload, optional
  createdAt: number;
}