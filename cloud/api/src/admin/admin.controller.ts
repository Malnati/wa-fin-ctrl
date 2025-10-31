// api/src/admin/admin.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  ApprovalActionDto,
  ApprovalListResponseDto,
  UserApprovalDto,
} from './dto/user-approval.dto';

@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  @Get('approvals')
  async getPendingApprovals(): Promise<ApprovalListResponseDto> {
    this.logger.log('Fetching pending approvals');
    return this.adminService.getPendingApprovals();
  }

  @Post('approve/:userId')
  @HttpCode(HttpStatus.OK)
  async approveUser(
    @Param('userId') userId: string,
    @Body() body: { approvedBy?: string } = {},
  ): Promise<UserApprovalDto> {
    const approvedBy = body.approvedBy || 'admin';
    this.logger.log(`Approving user ${userId} by ${approvedBy}`);
    return this.adminService.approveUser(userId, approvedBy);
  }

  @Post('reject/:userId')
  @HttpCode(HttpStatus.OK)
  async rejectUser(
    @Param('userId') userId: string,
    @Body() body: { rejectedBy?: string; reason?: string } = {},
  ): Promise<UserApprovalDto> {
    const rejectedBy = body.rejectedBy || 'admin';
    const reason = body.reason;
    this.logger.log(`Rejecting user ${userId} by ${rejectedBy}`);
    return this.adminService.rejectUser(userId, rejectedBy, reason);
  }

  @Post('bulk-approve')
  @HttpCode(HttpStatus.OK)
  async bulkApproveUsers(
    @Body() body: { userIds: string[]; approvedBy?: string },
  ): Promise<UserApprovalDto[]> {
    const { userIds, approvedBy = 'admin' } = body;
    this.logger.log(`Bulk approving ${userIds.length} users by ${approvedBy}`);
    return this.adminService.bulkApproveUsers(userIds, approvedBy);
  }

  @Get('user-status/:email')
  async getUserApprovalStatus(
    @Param('email') email: string,
  ): Promise<{ status: string }> {
    const status = await this.adminService.getUserApprovalStatus(email);
    return { status };
  }
}
