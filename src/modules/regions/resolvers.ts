import { AddRegionInput, Region } from '../../types/region';
import AppDataSource from "../../config/ormconfig";
import RegionEntity from "../../entities/regions.entity";

const resolvers = {
  Query: {
    regions: async(_parametr: unknown, input: AddRegionInput): Promise<RegionEntity[]> => {
      const regionsRepository = AppDataSource.getRepository(RegionEntity)
      
      if (input?.countryId) return await regionsRepository.findBy({ country_id: input.countryId })
      return await regionsRepository.find()
    }
  },
  Mutation: {
    addRegion: async(_parent: unknown, { input }: { input: AddRegionInput }): Promise<RegionEntity> => {
      const regionRepository = AppDataSource.getRepository(RegionEntity)

      let data = await regionRepository.findOneBy({ region_name: input.regionName, country_id: input.countryId})
      if (data !== null) throw new Error(`Bu Mamlakatda "${input.regionName}" viloyati mavjud`)

      let region = new RegionEntity()
      region.region_name = input.regionName
      region.country_id = input.countryId
      
      return await regionRepository.save(region)
    },
  },
  Region: {
		regionId: 	(global:Region) => global.region_id,
		regionName: 	(global:Region) => global.region_name,
		countryId: 	(global:Region) => global.country_id
	}
};

export default resolvers;