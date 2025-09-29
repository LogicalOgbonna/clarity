export interface Policy {
  id: number;
  domain: string;
  link: string;
  type: string;
  version: string;
  content: string;
  datePublished: Date;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: PolicyTag[];
}

export interface PolicyTag {
  id: number;
  policyId: number;
  tagId: number;
  createdAt: Date;
  tag: Tag;
}

export interface Tag {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
