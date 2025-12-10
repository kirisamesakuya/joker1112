
export enum TemplateStatus {
  ONLINE = '已上架',
  OFFLINE = '已下架',
  DRAFT = '草稿'
}

export enum GenerationStatus {
  COMPLETED = '已完成',
  PROCESSING = '生成中',
  FAILED = '失败'
}

export enum PublishStatus {
  ONLINE = '已上架',
  OFFLINE = '已下架'
}

export enum LipSyncMode {
  ORIGINAL = 'ORIGINAL',
  CUSTOM = 'CUSTOM'
}

export interface VideoTemplate {
  id: string;
  name: string;
  thumbnailUrl: string;
  duration: string; // e.g., "5s"
  resolution: string; // e.g., "720P"
  size?: number; // Size in bytes
  status: TemplateStatus;
  tags: string[]; // e.g., "Person", "Background"
  createdAt: number;
  // Feature flags
  supportLipSync?: boolean;
  lipSyncMode?: LipSyncMode;
  defaultScript?: string;
  // BOSS specific fields
  creator?: string;
  usageCount?: number;
  submitTime?: string;
}

export interface GenerationRecord {
  id: string;
  templateId: string;
  templateName: string;
  userName: string;
  thumbnailUrl: string;
  status: GenerationStatus;
  publishStatus?: PublishStatus; // New field for management
  timestamp: string;
  // BOSS specific fields
  videoNo?: string;
  userMobile?: string;
  shareCount?: number;
}

export interface DashboardStats {
  total: number;
  completed: number;
  processing: number;
  failed: number;
}

export enum BossTab {
  TEMPLATE_MGMT = 'TEMPLATE_MGMT',
  GENERATION_MGMT = 'GENERATION_MGMT'
}
