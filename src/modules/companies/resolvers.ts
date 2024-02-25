import { AddCompanyInput, Company } from '../../types/companies';
import { CompaniesEntity, CompanyBranchesEntity } from "../../entities/company.entity";
import AppDataSource from '../../config/ormconfig'
const resolvers = {
	Query: {
		companies: () => 'Hello world!',
	},
	Mutation: {
		addCompany: async(_parent: unknown, { input }: { input: AddCompanyInput }) => {
			console.log(input)
			let company = new CompaniesEntity()
			company.company_name = input.companyName
			
			const companyRepository = AppDataSource.getRepository(CompaniesEntity)
			let companyId = (await companyRepository.save(company)).company_id
			
			let branch = new CompanyBranchesEntity()
			branch.company_branch_phone = input.companyPhone
			branch.company_branch_subdomen = input.companyName.toLowerCase().trim().split(' ').join('')
			branch.branch_region_id = input.regionId
			branch.branch_company_id = companyId
			
			const branchRepository = AppDataSource.getRepository(CompanyBranchesEntity)
			let newBranch = await branchRepository.save(branch)

			
		},
	}
};

export default resolvers;