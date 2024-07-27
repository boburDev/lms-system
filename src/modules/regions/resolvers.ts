import { AddDistrictInput, AddRegionInput, District, Region, UpdateDistrictInput, UpdateRegionInput } from '../../types/region';
import AppDataSource from "../../config/ormconfig";
import RegionEntity, { Districts } from "../../entities/regions.entity";

const resolvers = {
  Query: {
    regions: async (_parametr: unknown, { countryId }: { countryId: string }, context: any): Promise<RegionEntity[] | null> => {
      if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
      const regionsRepository = AppDataSource.getRepository(RegionEntity)
      
      if (countryId) return await regionsRepository.findBy({ country_id: countryId })
      return null
    },
    regionById: async (_parametr: unknown, { Id }: { Id: string }, context: any): Promise<RegionEntity[] | null> => {
      if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
      const regionsRepository = AppDataSource.getRepository(RegionEntity)
      
      if (Id) return await regionsRepository.findBy({ country_id: Id })
      return null
    },
    districts: async (_parametr: unknown, { regionId }: { regionId: string }, context: any): Promise<Districts[] | null> => {
      if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
      const districtRepository = AppDataSource.getRepository(Districts)
      
      if (regionId) return await districtRepository.findBy({ region_id: regionId })
      return null
    },
    districtById: async (_parametr: unknown, { Id }: { Id: string }, context: any): Promise<Districts[] | null> => {
      if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
      const districtRepository = AppDataSource.getRepository(Districts)

      if (Id) return await districtRepository.findBy({ region_id: Id })
      return null
    }
  },
  Mutation: {
    addRegion: async(_parent: unknown, { input }: { input: AddRegionInput }, context: any): Promise<RegionEntity> => {
      if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
      const regionRepository = AppDataSource.getRepository(RegionEntity)

      let data = await regionRepository.findOneBy({ region_name: input.regionName, country_id: input.countryId})
      if (data !== null) throw new Error(`Bu Mamlakatda "${input.regionName}" viloyati mavjud`)

      let region = new RegionEntity()
      region.region_name = input.regionName
      region.country_id = input.countryId
      
      return await regionRepository.save(region)
    },
    updateRegion: async (_parent: unknown, { input }: { input: UpdateRegionInput }, context: any): Promise<RegionEntity> => {
      if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
      const regionRepository = AppDataSource.getRepository(RegionEntity)

      let region = await regionRepository.findOneBy({ region_id: input.regionId })
      if (!region) throw new Error(`Bu Mamlakatda "${input.regionName}" viloyati mavjud`)

      region.region_name = input.regionName || region.region_name
      region.country_id = input.countryId || region.country_id
      
      return await regionRepository.save(region)
    },
    addDistrict: async(_parent: unknown, { input }: { input: AddDistrictInput }, context: any): Promise<Districts> => {
      if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
      const districtRepository = AppDataSource.getRepository(Districts)

      let data = await districtRepository.findOneBy({ district_name: input.districtName, region_id: input.regionId})
      if (data !== null) throw new Error(`Bu viloyatda "${input.districtName}" viloyati mavjud`)

      let district = new Districts()
      district.district_name = input.districtName
      district.region_id = input.regionId
      
      return await districtRepository.save(district)
    },
    updateDistrict: async (_parent: unknown, { input }: { input: UpdateDistrictInput }, context: any): Promise<Districts> => {
      if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
      const districtRepository = AppDataSource.getRepository(Districts)

      let district = await districtRepository.findOneBy({ district_id: input.districtId })
      if (!district) throw new Error(`Bu viloyatda "${input.districtName}" viloyati mavjud`)
      
      district.district_name = input.districtName || district.district_name
      district.region_id = input.regionId || district.region_id

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