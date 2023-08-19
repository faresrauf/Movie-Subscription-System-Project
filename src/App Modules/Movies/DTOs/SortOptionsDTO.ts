/*eslint-disable*/
import { IsOptional, IsString } from "class-validator";

export class SortOptionsDTO {
    @IsString()
    @IsOptional()
    rating?: 'asc' | 'desc';

    @IsString()
    @IsOptional()
    title?: 'asc' | 'desc';

    @IsString()
    @IsOptional()
    dateofrelease?: 'asc' | 'desc';
    //popularity?: 'asc' | 'desc';
}


export const SortOptions =  [
    'title',
    'rating',
    'yearofrelease'
];

export const SortOrder = [
    'DESC',
    'ASC'
];

