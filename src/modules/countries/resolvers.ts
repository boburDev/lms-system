import { AddCountryInput, Country } from '../../types/country';
import AppDataSource from "../../config/ormconfig";
import CountryEntity from "../../entities/country.entity";

const resolvers = {
  Query: {
    countries: async (_parent: unknown, {}, context: any): Promise<CountryEntity[]> => {
      if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
      const countryRepository = AppDataSource.getRepository(CountryEntity)
      return await countryRepository.find()
    }
  },
  Mutation: {
    addCountry: async (_parent: unknown, { input }: { input: AddCountryInput }, context: any): Promise<CountryEntity> => {
      if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
      const countryRepository = AppDataSource.getRepository(CountryEntity)
      
      let country = new CountryEntity()
      country.country_name = input.countryName
      
      return await countryRepository.save(country)
    },
  },
  Country: {
		countryId: 	(global:Country) => global.country_id,
		countryName: 	(global:Country) => global.country_name
	}
};

export default resolvers;