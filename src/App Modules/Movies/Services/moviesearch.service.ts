/*eslint-disable*/
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { RepositoryUtil } from "src/Shared Modules/Repository/repositoryutil";
import { Like } from "typeorm";
import { Movie } from "../Models/movie.entity";
import { SearchOptionsDTO } from "../DTOs/SearchOptionsDTO";
import { SortOptions, SortOrder } from "../DTOs/SortOptionsDTO";
import { PaginationOptionsDTO } from "../DTOs/PaginationOptionsDTO";
import { config } from 'dotenv';
import { Genre } from "../Models/genre.entity";
import { DetailedMovieResponseDTO } from "../DTOs/DetailedMovieResponseDTO";
config();

@Injectable()
export class MovieSearchService {
    constructor(
        private readonly repositoryUtil: RepositoryUtil
    ) { }

    async searchMovies(
        searchFilter: SearchOptionsDTO,
        paginationParameter: PaginationOptionsDTO,
        sortField: string,
        sortOrder: string
    ): Promise<Movie[]> {

        const MovieRepository = this.repositoryUtil.getRepository(Movie);

        if (searchFilter.title) {
            searchFilter.title = Like(`%${searchFilter.title}%`);
        }

        const page = paginationParameter.page ?? 0;
        const items = paginationParameter.items ?? 10;
        const sortParameter = sortField ?? 'yearofrelease';
        const orderParameter = sortOrder ?? 'DESC';

        if(!SortOptions.includes(sortParameter)) {
            throw new BadRequestException('Invalid order field');
        }

        if(!SortOrder.includes(orderParameter)) {
            throw new BadRequestException('Invalid sort order');
        }

        const searchResult = await MovieRepository.find({
            where: searchFilter,
            skip: (page) * items,
            take: items,
            order: {
                [sortParameter] : orderParameter
            }
        });

        return searchResult as Movie[];
    }

    async getMovieViewDetails(id: number) {
        const movie = await this.repositoryUtil.getRepository(Movie)
        .findOne({
            relations: ['genres'] ,
            where: { movieid: id }
        });

        const movieIMDBData = await 
        this.fetchMoviePosterAndDescription(movie.title);
        
        return new DetailedMovieResponseDTO(
            movie.title,
            movie.genres,
            movieIMDBData[0],
            movie.director,
            movie.yearofrelease,
            movie.duration,
            movie.avgrating,
            movieIMDBData[1]
        );        
    }

    async fetchMoviePosterAndDescription(title: string) {
        const movieData = await fetch(process.env.API_IMDB+title);
        const movieResponse = await movieData.json();
        return [ movieResponse.Poster, movieResponse.Plot ];
    }
}