import { AddEmployerInput, Employer } from "../../types/employers";
import AppDataSource from "../../config/ormconfig";
import EmployerEntity from "../../entities/employers.entity";
import positionIndicator from "../../utils/employer_positions";

const resolvers = {
  Query: {
    employers: async (_parametr: unknown, { }, context: any): Promise<EmployerEntity[]> => {
      if (!context?.branchId) throw new Error("Not exist access token!");

      const employerRepository = AppDataSource.getRepository(EmployerEntity)
      let data = await employerRepository.find({
        where: { employer_branch_id: context.branchId },
        order: { employer_created: "DESC" }
      })
      return data
    },
  },
  Mutation: {
    addEmployer: async (_parent: unknown, { input }: { input: AddEmployerInput }, context: any): Promise<EmployerEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");

      const employerRepository = AppDataSource.getRepository(EmployerEntity)

      let data = await employerRepository.createQueryBuilder("employer")
        .where("employer.employer_name = :name", { name: input.employerName })
        .andWhere("employer.employer_branch_id = :id", { id: context.branchId })
        .andWhere("employer.employer_deleted IS NULL")
        .getOne()

      if (data !== null) throw new Error(`Bu Filialda "${input.employerPhone}" raqamli hodim mavjud`)

      let employer = new EmployerEntity()
      employer.employer_name = input.employerName
      employer.employer_phone = input.employerPhone
      employer.employer_position = Number(positionIndicator(input.employerPosition))
      employer.employer_password = input.employerPassword
      employer.employer_branch_id = context.branchId

      return await employerRepository.save(employer)
    },
    deleteEmployer: async (_parent: unknown, { employerId }: { employerId: string }, context: any): Promise<EmployerEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");

      const employerRepository = AppDataSource.getRepository(EmployerEntity)

      let data = await employerRepository.createQueryBuilder("employer")
        .where("employer.employer_id = :id", { id: employerId })
        .andWhere("employer.employer_deleted IS NULL")
        .getOne()

      if (data === null) throw new Error(`Bu hodim mavjud emas`)

      data.employer_deleted = new Date()
      await employerRepository.save(data)
      return data
    }
  },
  Employer: {
    employerId: (global: Employer) => global.employer_id,
    employerName: (global: Employer) => global.employer_name,
    employerPhone: (global: Employer) => global.employer_phone,
    employerBirthday: (global: Employer) => global.employer_birthday,
    employerGender: (global: Employer) => global.employer_gender,
    employerPosition: (global: Employer) => positionIndicator(global.employer_position),
    employerUseLang: (global: Employer) => global.employer_usage_lang,
    employerCreatedAt: (global: Employer) => global.employer_created,
    employerDeletedAt: (global: Employer) => global.employer_deleted,
    employerBranchId: (global: Employer) => global.employer_branch_id,
  }
};

export default resolvers;