import { HttpService } from "@nestjs/axios";
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import * as config from 'config';
import { lastValueFrom } from "rxjs";

@Injectable()
export class SummaryService {
    private logger = new Logger('SummaryService');
    constructor(private readonly httpService: HttpService) {}

    async summarizeContent(content: string): Promise<string> {
        // 원문이 짧은 경우 요약하지 않고 그대로 반환
        if (content.length <= 100) {
            this.logger.log(`Content is too short. Summarization is not working.`);
            return content;
        }

        const clovaConfig = config.get('clova');
        const clientId = clovaConfig.id;
        const clientSecret = clovaConfig.secret;
        const dataOption = clovaConfig.data.option;

        const url = 'https://naveropenapi.apigw.ntruss.com/text-summary/v1/summarize';

        const headers = {
            'X-NCP-APIGW-API-KEY-ID': clientId,
            'X-NCP-APIGW-API-KEY': clientSecret,
            'Content-Type': 'application/json',
        };
        const data = {
            document: {
                content: content,
            },
            option: {
                language: dataOption.language,
                // model: dataOption.model,
                model: 'asdf',
                tone: dataOption.tone,
                summaryCount: dataOption.summaryCount
            },
        };

        try {
            const response = await lastValueFrom(
                this.httpService.post(url, data, { headers }),
            );
            return response.data.summary;
        } catch (error) {
            if (error.response) {
                this.handleErrorResponse(error.response);
            } else {
                this.logger.error('Unexpected error occerred', error);
                throw new InternalServerErrorException('Failed to summarize content: ' + error.message);
            }
        }
    }

    private handleErrorResponse(response: any) {
        if (response.status === 400) {
            switch (response.data.error.errorCode) {
                case 'E001':
                    throw new BadRequestException('빈 문자열 or blank 문자');
                case 'E002':
                    throw new BadRequestException('UTF-8 인코딩 에러');
                case 'E003':
                    throw new BadRequestException('문장이 기준치보다 초과 했을 경우');
                case 'E100':
                    throw new BadRequestException('유효한 문장이 부족한 경우');
                case 'E101':
                    throw new BadRequestException('Unsupported language. Supported languages are: ko, ja.');
                case 'E102':
                    throw new BadRequestException('Unsupported model. Supported models are: general, news.');
                case 'E103':
                    throw new BadRequestException('Invalid request body. Check JSON format or required parameters.');
                case 'E415':
                    throw new BadRequestException('Unsupported media type. Check content-type.');
                case 'E900':
                    throw new BadRequestException('Unexpected error. Bad Request.');
                default:
                    throw new BadRequestException('Unknown error occurred.');
            }
        } else if (response.status === 500) {
            switch (response.data.errorCode) {
                case 'E501':
                    throw new InternalServerErrorException('Endpoint connection failed.');
                case 'E900':
                    throw new InternalServerErrorException('Unexpected error occurred. Server Error.');
                default:
                    throw new InternalServerErrorException('Unknown server error occurred.');
            }
        }
    }
}