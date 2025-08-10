export interface IUser {
    fullName: string,
    password: string,
    email: string,
    dateOfBirth: Date,
    gender: string,
    metrics: {
        weight: number,
        height: number,
        waistToHipRatio:number,
        shoulerToWaistRatio:number,
        percentOfLegsLength:number,
        shoulderAsymmetricLine:number,
        shoulderAngle:number

    },
    targetWeight: number,
    fitnessLevel: "Beginner" | "Intermediate" | "Advanced",
    primaryFitnessGoal: "Lose weight" | "Gain muscle" | "Stay fit" | "Improve endurance",
}