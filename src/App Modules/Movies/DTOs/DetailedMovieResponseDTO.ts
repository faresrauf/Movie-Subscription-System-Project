/*eslint-disable*/
import { Genre } from "../Models/genre.entity";

export class DetailedMovieResponseDTO {
    constructor(
        public Title: string,
        public Genres: Genre[],
        public Poster: string,
        public Director: string,
        public DateOfRelease: Date,
        public Duration: string,
        public Rating: number,
        public Description: string
    ) {}
}
