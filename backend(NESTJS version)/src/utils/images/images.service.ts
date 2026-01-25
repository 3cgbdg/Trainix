import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { Exercise, Meal } from "generated/prisma/browser";
import { S3Service } from "./s3/s3.service";
import { MealDto } from "src/nutrition-plan/dto/create-nutrition-plan.dto";

@Injectable()
export class ImagesService {
    constructor(private readonly configService: ConfigService, private readonly s3Service: S3Service) { }
    async searchPhotos(query: string): Promise<string[] | undefined> {
        const UNSPLASH_ACCESS_KEY = this.configService.get<string>("UNSPLASH_ACCESS_KEY");
        if (!UNSPLASH_ACCESS_KEY)
            throw new BadRequestException()
        const res = await axios.get('https://api.unsplash.com/search/photos', {
            params: { query, per_page: 10 },
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        });
        const urls = res.data.results.map((photo: any) => photo.urls.full);
        return urls;
    }

    async s3ImageUploadingMeal(data: MealDto): Promise<string>  {
        let url: string;
        // getting urls of images from unsplash
        const urls = await this.searchPhotos(data.mealTitle);
        const AWS_S3_BUCKET_NAME = this.configService.get<string>("AWS_S3_BUCKET_NAME")
        if (!AWS_S3_BUCKET_NAME)
            throw new BadRequestException();
        if (!urls) {
            url = "food-placeholder.jpg";
            return url;

        }
        else {
            const response = await axios.get(urls[0], { responseType: "arraybuffer" });
            const buffer = Buffer.from(response.data, 'binary');
            const title: string = data.mealTitle;
            const key = `${AWS_S3_BUCKET_NAME}/food-images/${title.toLowerCase().split(" ").join("_")}.jpg`
            await this.s3Service.uploadFile(buffer, key);
            url = `https://d1llcprgwazvgp.cloudfront.net/${key}`;
            return url;
        }

    }

    async s3ImageUploadingExercise  (data: Exercise): Promise<string>  {
        let url: string;

        // getting urls of images from unsplash
        const urls = await this.searchPhotos(data.title + " workout");

        if (!urls) {
            url = "exercise-placeholder.jpg";
            return url;

        }
        else {
            const response = await axios.get(urls[0], { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            const title: string = data.title;

            const AWS_S3_BUCKET_NAME = this.configService.get<string>("AWS_S3_BUCKET_NAME")
            if (!AWS_S3_BUCKET_NAME)
                throw new BadRequestException();

            const key = `${AWS_S3_BUCKET_NAME}/exercise-images/${title.toLowerCase().split(" ").join("_")}.jpg`

            await this.s3Service.uploadFile(buffer, key);

            url = `https://d1llcprgwazvgp.cloudfront.net/${key}`;
            return url;
        }

    }


}