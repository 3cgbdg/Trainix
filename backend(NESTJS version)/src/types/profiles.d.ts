export type UserProfile = Prisma.UserGetPayload<{
    omit: { password: true }
    include: {
        metrics: true
    }
}>
