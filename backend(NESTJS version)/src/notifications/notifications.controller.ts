import { Controller, Get, Param, Delete, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import type { Request } from 'express';
import { IReturnMessage, ReturnDataType } from 'src/types/common';
import { Notification } from 'generated/prisma/browser';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }
  @Delete(":id")
  async deleteNotification(@Param("id") id: string): Promise<IReturnMessage> {
    return this.notificationsService.deleteNotification(id);
  }
  @Get("")
  async getNotifications(@Req() req : Request): Promise<ReturnDataType<Notification[]>> {
    return this.notificationsService.getNotifications((req as any).user.id);
  }
}
