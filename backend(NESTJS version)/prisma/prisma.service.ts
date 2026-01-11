import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client/extension";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit {

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

}