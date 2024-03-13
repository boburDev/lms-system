import AppDataSource from '../../config/ormconfig'
import { AddCompanyInput } from '../../types/createAccaunt';
import { Companies, CompanyBranches } from "../../entities/company.entity";
import EmployersEntity from '../../entities/employers.entity';

const resolvers = {
	Query: {
		companies: () => 'Hello world!',
	},
	Mutation: {
		addCompany: async(_parent: unknown, { input }: { input: AddCompanyInput }) => {
			
		},
	}
};

export default resolvers;