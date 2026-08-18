import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import axios from "axios";
import { IMeal } from "../models/NutritionPlan";
import { IExercise } from "../models/FitnessPlan";

// strips anything but letters/numbers/spaces (any script, via Unicode property
// escapes) so a title can't inject "/" or ".." segments into the S3 key and
// escape the intended food-images/exercise-images folder, without collapsing
// non-Latin titles down to a single shared "untitled" key
const sanitizeKeySegment = (title: string): string =>
    title.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim().split(/\s+/).join("_") || "untitled";

export const searchPhotos = async (query: string): Promise<string[] | undefined> => {
    try {
        const res = await axios.get('https://api.unsplash.com/search/photos', {
            params: { query, per_page: 10 },
            headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
        });
        const urls = res.data.results.map((photo: any) => photo.urls.full);
        return urls;
    } catch (error) {
        console.error(error);
    }
}

export const s3ImageUploadingMeal = async (data: IMeal): Promise<string> => {
    let url: string;
    // s3 bucket initialization
    const s3 = new S3Client({
        region: process.env.REGION_NAME!,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
    })
    // getting urls of images from unsplash
    const urls = await searchPhotos(data.mealTitle);

    if (!urls) {
        url = "food-placeholder.jpg";
        return url;

    }
    else {
        try {
            const response = await axios.get(urls[0], { responseType: "arraybuffer" });
            const buffer = Buffer.from(response.data, 'binary');
            const key = `${process.env.AWS_S3_BUCKET_NAME}/food-images/${sanitizeKeySegment(data.mealTitle)}.jpg`
            await s3.send(new PutObjectCommand({
                Body: buffer,
                Key: key,
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                ContentType: "image/jpeg"
            }))

            url = `https://d1llcprgwazvgp.cloudfront.net/${key}`;
            return url;
        } catch (error) {
            console.error(error);
            return "food-placeholder.jpg";
        }
    }

}
export const s3ImageUploadingExercise = async (data: IExercise): Promise<string> => {
    let url: string;
    // s3 bucket initialization
    const s3 = new S3Client({
        region: process.env.REGION_NAME!,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
    })
    // getting urls of images from unsplash
    const urls = await searchPhotos(data.title + " workout");

    if (!urls) {
        url = "exercise-placeholder.jpg";
        return url;

    }
    else {
        try {
            const response = await axios.get(urls[0], { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            const key = `${process.env.AWS_S3_BUCKET_NAME}/exercise-images/${sanitizeKeySegment(data.title)}.jpg`
            await s3.send(new PutObjectCommand({
                Body: buffer,
                Key: key,
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                ContentType: "image/jpeg"
            }))

            url = `https://d1llcprgwazvgp.cloudfront.net/${key}`;
            return url;
        } catch (error) {
            console.error(error);
            return "exercise-placeholder.jpg";
        }
    }

}
