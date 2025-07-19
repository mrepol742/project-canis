export interface User {
  id: number;
  lid: string;
  name: string;
  number: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Block {
  id: number;
  lid: string;
  number: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: number;
  gid: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

declare function findOrCreateUser(number: string): Promise<User>;
