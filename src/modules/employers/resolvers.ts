import { AddEmployerInput, Employer } from "../../types/employers";
import AppDataSource from "../../config/ormconfig";
import EmployerEntity from "../../entities/employers.entity";
import positionIndicator from "../../utils/employer_positions";

const resolvers = {
  Query: {
    employers: async (_parametr: unknown, {}, context:any): Promise<EmployerEntity[]> => {
      const employerRepository = AppDataSource.getRepository(EmployerEntity)
      return await employerRepository.find({ where: { employer_branch_id: context.branchId }})
    },
  },
  Mutation: {
    addEmployer: async (_parent: unknown, { input }: { input: AddEmployerInput }, context:any) => {
      const employerRepository = AppDataSource.getRepository(EmployerEntity)

      let data = await employerRepository.findOneBy({ employer_phone: input.employerPhone, employer_branch_id: context.branchId })
      if (data !== null) throw new Error(`Bu Filialda "${input.employerPhone}" raqamli hodim mavjud`)

      let employer = new EmployerEntity()
      employer.employer_name = input.employerName
      employer.employer_phone = input.employerPhone
      employer.employer_position = Number(positionIndicator(input.employerPosition))
      employer.employer_password = input.employerPassword
      employer.employer_branch_id = context.branchId
      
      return await employerRepository.save(employer)
    }
  },
  Employer: {
    employerId: (global: Employer) => global.employer_id,
    employerName: (global: Employer) => global.employer_name,
    employerPhone: (global: Employer) => global.employer_phone,
    employerBirthday: (global: Employer) => global.employer_birthday,
    employerGender: (global: Employer) => global.employer_gender,
    employerPosition: (global: Employer) => global.employer_position,
    employerUseLang: (global: Employer) => global.employer_usage_lang,
    employerCreatedAt: (global: Employer) => global.employer_created,
    employerDeletedAt: (global: Employer) => global.employer_deleted,
    employerBranchId: (global: Employer) => global.employer_branch_id,
  }
};

export default resolvers;