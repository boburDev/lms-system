import { AddCountryInput, Country, UpdateCountryInput } from '../../types/country';
import AppDataSource from "../../config/ormconfig";
import CountryEntity from "../../entities/country.entity";

const resolvers = {
  Query: {
    countries: async (_parent: unknown, {}, context: any): Promise<CountryEntity[]> => {
      if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors
      try {
        const countryRepository = AppDataSource.getRepository(CountryEntity)
        return await countryRepository.find()
      } catch (error) {
        await catchErrors(error, 'countries')
        throw error;
      }
    },
    countryById: async (_parent: unknown, { Id }: { Id: string }, context: any): Promise<CountryEntity | null> => {
      if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors
      try {
        const countryRepository = AppDataSource.getRepository(CountryEntity)
        return await countryRepository.findOneBy({ country_id: Id })
      } catch (error) {
        await catchErrors(error, 'countryById')
        throw error;
      }
    }
  },
  Mutation: {
    addCountry: async (_parent: unknown, { input }: { input: AddCountryInput }, context: any): Promise<CountryEntity> => {
      if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors
      try {
        const countryRepository = AppDataSource.getRepository(CountryEntity)

        let country = new CountryEntity()
        country.country_name = input.countryName

        return await countryRepository.save(country)
      } catch (error) {
        await catchErrors(error, 'addCountry')
        throw error;
      }
    },
    updateCountry: async (_parent: unknown, { input }: { input: UpdateCountryInput }, context: any): Promise<CountryEntity> => {
      if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors
      try {
        const countryRepository = AppDataSource.getRepository(CountryEntity)
        let country = await countryRepository.findOneBy({ country_id: input.countryId })
        if (!country) throw new Error(`Room not found`)
        country.country_name = input.countryName
        country = await countryRepository.save(country)
        return country
      } catch (error) {
        await catchErrors(error, 'updateCountry')
        throw error;
      }
    },
  },
  Country: {
		countryId: 	(global:Country) => global.country_id,
		countryName: 	(global:Country) => global.country_name
	}
};

export default resolvers;