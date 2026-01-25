import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMeasurementDto {
    @IsNotEmpty()
    @IsString()
    metricsId: string;

    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsOptional()
    @IsString()
    imageUrl: string;
}
