export type Lang = "uz" | "en";
export type Kind = "lost" | "found";
export type ItemStatus = "open" | "claimed" | "reunited" | "closed";
export type Category =
  | "documents"
  | "electronics"
  | "books"
  | "keys"
  | "clothing"
  | "bags"
  | "sport"
  | "other";
export type PartnerTier = "none" | "campus" | "gold" | "kiosk";
export type Role = "student" | "admin" | "partner";

export type Spot = {
  id: string;
  nameUz: string;
  nameEn: string;
  x: number;
  y: number;
};

export type University = {
  id: string;
  slug: string;
  nameUz: string;
  nameEn: string;
  short: string;
  city: string;
  students: number;
  partner: PartnerTier;
  spots: Spot[];
  accent: string;
  blurbUz: string;
  blurbEn: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  universityId: string;
  phone?: string;
  role: Role;
  createdAt: string;
};

export type Item = {
  id: string;
  kind: Kind;
  title: string;
  description: string;
  category: Category;
  universityId: string;
  spotId: string;
  occurredAt: string;
  createdAt: string;
  userId: string;
  status: ItemStatus;
  color?: string;
  brand?: string;
  secretQuestion?: string;
  secretAnswer?: string;
  emoji: string;
  hue: number;
};

export type Claim = {
  id: string;
  itemId: string;
  fromUserId: string;
  message: string;
  secretAttempt?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

export type Thread = {
  id: string;
  itemId: string;
  userA: string;
  userB: string;
  createdAt: string;
};

export type Message = {
  id: string;
  threadId: string;
  fromUserId: string;
  body: string;
  createdAt: string;
};

export type PartnerLead = {
  id: string;
  org: string;
  email: string;
  kind: string;
  note: string;
  createdAt: string;
};

export type Database = {
  universities: University[];
  users: User[];
  items: Item[];
  claims: Claim[];
  threads: Thread[];
  messages: Message[];
  leads: PartnerLead[];
};

export type PublicUser = Omit<User, "passwordHash">;

export type MatchHit = {
  item: Item;
  score: number;
  reasons: string[];
};
