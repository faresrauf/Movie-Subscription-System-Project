/* eslint-disable */
import { UserAccount } from 'src/App Modules/Auth/Models/user.entity';
import { Genre } from 'src/App Modules/Movies/Models/genre.entity';
import { Movie } from 'src/App Modules/Movies/Models/movie.entity';
import { SubscriptionDetails } from 'src/App Modules/Subscriptions/Models/subscriptiondetails.entity';
import { DataSource } from 'typeorm';

export const databaseProvider = 
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: '965163234',
          database: 'Movie Subscription System',
          entities: [UserAccount, SubscriptionDetails, Movie, Genre],
          logging: true,
          synchronize: false,
      });

      return dataSource.initialize();
    }
  };