import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification } from 'generated/prisma/browser';
import { PrismaService } from 'prisma/prisma.service';
import { IReturnMessage, ReturnDataType } from 'src/types/common';

@Injectable()
export class NotificationsService {

  constructor(private readonly prisma: PrismaService) { };

  async deleteNotification(id: string): Promise<IReturnMessage> {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');

    await this.prisma.notification.delete({ where: { id } });
    return { message: 'Deleted Successfully!' };

  }

  async getNotifications(myId: string): Promise<ReturnDataType<Notification[]>> {
    const notifications = await this.prisma.notification.findMany({ where: { userId: myId } });
    return ({ data: notifications });
  }


}
