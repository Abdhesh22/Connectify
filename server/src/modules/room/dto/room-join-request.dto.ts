import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class JoinRequestListDto {

    @Type(() => Number)
    @IsNumber()
    skip: number;

    @Type(() => Number)
    @IsNumber()
    limit: number;
}