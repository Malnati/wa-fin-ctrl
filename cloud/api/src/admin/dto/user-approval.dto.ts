// api/src/admin/dto/user-approval.dto.ts

export enum UserApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface UserApprovalDto {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  status: UserApprovalStatus;
  approvedAt?: string;
  approvedBy?: string;
}

export interface ApprovalActionDto {
  userId: string;
  action: 'approve' | 'reject';
  reason?: string;
}

export interface ApprovalListResponseDto {
  users: UserApprovalDto[];
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
