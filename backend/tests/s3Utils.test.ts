import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";
import { IMeal } from '../models/NutritionPlan';
//mocking s3-client 
jest.mock('@aws-sdk/client-s3', () => {
    const original = jest.requireActual('@aws-sdk/client-s3');
    return {
        ...original,
        S3Client: jest.fn().mockImplementation(() => ({
            send: jest.fn().mockResolvedValue({})
        })),
        PutObjectCommand: jest.fn()
    };
});
import { s3ImageUploadingMeal } from '../utils/images';
import { S3Client } from '@aws-sdk/client-s3';
import * as images from "../utils/images";
// mocking axios
import axios from 'axios';
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
describe("s3 funcs", () => {
    // mongo in-memory server for not using real db 
    let mongo: MongoMemoryServer;
    const meal: IMeal = {
        mealTitle: "pizza",
        time: "14:00",
        imageUrl: "url",
        description: "dsada",
        ingredients: ["dasdasdas"],
        preparation: "dasdas",
        mealCalories: 12,
        mealProtein: 12,
        mealCarbs: 12,
        mealFats: 12,
        status: "pending",
        foodIntake: "Dinner",
    };
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        const uri = mongo.getUri();
        await mongoose.connect(uri);

    })
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.AWS_ACCESS_KEY_ID = 'test-key';
        process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
        process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
        process.env.REGION_NAME = 'test-region';
    });
    afterAll(async () => {
        await mongoose.connection.close();
        await mongo.stop();
    });


    describe("s3-meal-image-upload", () => {
        it("if url was not found on unsplash", async () => {
            // returning null
            jest.spyOn(images, "searchPhotos").mockResolvedValueOnce(undefined);
            const returnValue = await s3ImageUploadingMeal(meal);
            expect(returnValue).toBe("food-placeholder.jpg")

        })
        it('should upload image to S3 and return URL', async () => {
            // creting fake url and returning it
            const fakeUrl = 'https://unsplash.com/photo/test';
            jest.spyOn(images, "searchPhotos").mockResolvedValue([fakeUrl]);
            // mocking responseType-arraybuffer
            mockedAxios.get.mockResolvedValue({ data: Buffer.from('test') });
            const url = await s3ImageUploadingMeal(meal);
            expect(S3Client).toHaveBeenCalled();
            expect(url).toContain('https://test-bucket.s3.test-region.amazonaws.com/');
            expect(url).toContain('pizza.jpg');
        });
    })


})