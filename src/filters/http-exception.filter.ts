// import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
// import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
// import { Response } from "express";

// @Catch()
// export class HttpExceptionFilter implements ExceptionFilter {
//     catch(exception: any, host: ArgumentsHost) {
//         const ctx = host.switchToHttp();
//         const response = ctx.getResponse<Response>();

//         let status = 500; // Sets default status code to 500
//         let message = 'Internal server error'; // Sets default message
//         let code = 'INTERNAL_SERVER_ERROR'; // Sets default error code

//         if (exception instanceof HttpException) {
//             status = exception.getStatus(); // Gets the status code from the exception
//             message = exception.message;

//         } else if (exception instanceof PrismaClientKnownRequestError) {
//             status = 400;
//             message = this.handlePrismaError(exception);
//             code = exception.code;
//         } else if (exception instanceof Error) {
//             message = exception.message; // Gets the message from the exception
//         }

//         response.status(status).json({
//             success: false,
//             error: {
//                 code,
//                 message,
//                 timestamp: new Date().toISOString()
//             }
//         });
//     }

//     private handlePrismaError(error: PrismaClientKnownRequestError): string {
//         switch (error.code) {
//             case 'P2002':
//                 return 'Unique constraint violation - this email is already registered';
//             case 'P2025':
//                 return 'Record not found';
//             default:
//                 return `Database error: ${error.message}`;
//         }
//     }
// }

// src/filters/http-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { GraphQLResolveInfo } from 'graphql';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter, GqlExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const gqlHost = GqlArgumentsHost.create(host);
        const info = gqlHost.getInfo<GraphQLResolveInfo>();

        // Handle GraphQL requests
        if (info) {
            // Convert to GraphQL error format
            if (exception instanceof HttpException) {
                return exception;
            }
            return new HttpException(
                'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        // Handle REST requests
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.message
                : 'Internal server error';

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        });
    }
}