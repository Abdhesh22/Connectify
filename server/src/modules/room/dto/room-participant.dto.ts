import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ParticipantListDto {

    @Type(() => Number)
    @IsNumber()
    skip: number;

    @Type(() => Number)
    @IsNumber()
    limit: number;
}