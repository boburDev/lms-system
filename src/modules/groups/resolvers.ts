import { AddGroupInput, Group } from '../../types/groups';
import AppDataSource from "../../config/ormconfig";
import CountryEntity from "../../entities/country.entity";

const resolvers = {
  Query: {
    countries: async(): Promise<CountryEntity[]> => {
      const countryRepository = AppDataSource.getRepository(CountryEntity)
      return await countryRepository.find()
    }
  },
  Mutation: {
    addGroup: async (_parent: unknown, { input }: { input: AddGroupInput }): Promise<CountryEntity> => {
      let country = new CountryEntity()
      country.country_name = input.groupName
      
      const countryRepository = AppDataSource.getRepository(CountryEntity)
      return await countryRepository.save(country)
    },
  },
  // Country: {
	// 	countryId: 	(global:Group) => global.country_id,
	// 	countryName: 	(global:Group) => global.country_name
	// }
};

export default resolvers;