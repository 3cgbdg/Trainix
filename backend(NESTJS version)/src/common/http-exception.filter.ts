import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Response } from "express";



@Catch(HttpException)


export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const errResponse = exception.getResponse()
        const statusCode = exception.getStatus()

        return response.status(statusCode).json({
            statusCode: statusCode,
            error: errResponse,
            timestamp: new Date().toISOString(),
            path: request.url
        })
    }

    
}