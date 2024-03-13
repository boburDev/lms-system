import { AddDistrictInput, AddRegionInput, District, Region } from '../../types/region';
import AppDataSource from "../../config/ormconfig";
import RegionEntity, { Districts } from "../../entities/regions.entity";

const resolvers = {
  Query: {
    regions: async(_parametr: unknown, input: AddRegionInput): Promise<RegionEntity[]> => {
      const regionsRepository = AppDataSource.getRepository(RegionEntity)
      
      if (input?.countryId) return await regionsRepository.findBy({ country_id: input.countryId })
      return await regionsRepository.find()
    },
    districts: async(_parametr: unknown, input: AddDistrictInput): Promise<Districts[]> => {
      const districtRepository = AppDataSource.getRepository(Districts)
      
      if (input?.regionId) return await districtRepository.findBy({ region_id: input.regionId })
      return await districtRepository.find()
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
    addDistrict: async(_parent: unknown, { input }: { input: AddDistrictInput }): Promise<Districts> => {
      const districtRepository = AppDataSource.getRepository(Districts)

      let data = await districtRepository.findOneBy({ district_name: input.districtName, region_id: input.regionId})
      if (data !== null) throw new Error(`Bu viloyatda "${input.districtName}" viloyati mavjud`)

      let district = new Districts()
      district.district_name = input.districtName
      district.region_id = input.regionId
      
      return await districtRepository.save(district)
    },
  },
  Region: {
		regionId: 	(global:Region) => global.region_id,
		regionName: 	(global:Region) => global.region_name,
		countryId: 	(global:Region) => global.country_id
	},
  District: {
    districtId: (global: District) => global.district_id,
    districtName: (global: District) => global.district_name,
    regionId: (global: District) => global.region_id,
  }
};

export default resolvers;