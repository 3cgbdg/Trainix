import { Prisma } from "generated/prisma/browser";

export type MeasurementType = Prisma.MeasurementGetPayload<{
    include: {
        metrics: true
    }
}>