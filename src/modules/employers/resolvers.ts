import { AddEmployerInput, Employer, UpdateEmployerInput, UpdateEmployerProfileInput } from "../../types/employer";
import AppDataSource from "../../config/ormconfig";
import EmployerEntity from "../../entities/employer/employers.entity";
import positionIndicator, { genderIndicator, getPermissions } from "../../utils/status_and_positions";
import permission from './employer_permission.json'
import SalaryEntity from "../../entities/employer/salary.entity";
import { IsNull } from "typeorm";

export type Permission = {
  [key: string]: Permission | boolean;
};

const resolvers = {
  Query: {
    employers: async (_parametr: unknown, { }, context: any): Promise<EmployerEntity[]> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const employerRepository = AppDataSource.getRepository(EmployerEntity)
      let data = await employerRepository.find({
        where: { employer_branch_id: context.branchId, employer_activated: true, employer_deleted: IsNull() },
        order: { employer_created: "DESC" }
      })
      return data
    },
    employerById: async (_parametr: unknown, input: { employerId: string }, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const employerRepository = AppDataSource.getRepository(EmployerEntity)
      let data = await employerRepository.createQueryBuilder("employer")
        .where("employer.employer_id = :Id", { Id: input.employerId })
        .andWhere("employer.employer_branch_id = :id", { id: context.branchId })
        .andWhere("employer.employer_activated = true")
        .andWhere("employer.employer_deleted IS NULL")
        .getOne()
      if (!data) throw new Error(`Bu Filialda bu hodim mavjud emas`)
      return data
    },
    employerRoles: async (_parametr: unknown, {}, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      if (['ceo', 'director', 'administrator'].includes(context.role)) return employerPermissionByRole(context.role)
      throw new Error("Unexpected role");
    },
    employerPermissions: async (_parametr: unknown, { employerRole }: { employerRole: string }, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      let permissions = getPermissions(employerRole, permission)
      if (permissions && permissions.error) throw new Error(permissions.message);
      return JSON.stringify(permissions)
    }
  },
  Mutation: {
    addEmployer: async (_parent: unknown, { input }: { input: AddEmployerInput }, context: any): Promise<EmployerEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const employerRepository = AppDataSource.getRepository(EmployerEntity)
      
      let data = await employerRepository.createQueryBuilder("employer")
        .where("employer.employer_phone = :phone", { phone: input.employerPhone })
        .andWhere("employer.employer_branch_id = :id", { id: context.branchId })        
        .andWhere("employer.employer_activated = true")
        .andWhere("employer.employer_deleted IS NULL")
        .getOne()

        if (data != null) throw new Error(`Bu Filialda "${input.employerPhone}" raqamli hodim mavjud`)
      let employerPermission = getChangedPermissions(permission, JSON.parse(input.employerPermission))
    
      let employer = new EmployerEntity()
      employer.employer_name = input.employerName
      employer.employer_phone = input.employerPhone
      if (!isNaN(new Date(input.employerBirthday).getTime()) ) {
        employer.employer_birthday = new Date(input.employerBirthday)
      }
      if (input.employerGender) {
        employer.employer_gender = Number(genderIndicator(input.employerGender)) || null
      }
      employer.employer_position = Number(positionIndicator(input.employerPosition))
      employer.employer_password = input.employerPassword
      employer.permissions = employerPermission
      employer.employer_branch_id = context.branchId
      let newEmployer = await employerRepository.save(employer)

      const employerSalaryRepository = AppDataSource.getRepository(SalaryEntity)
      let employerSalary = new SalaryEntity()
      employerSalary.salary_history_branch_id = context.branchId
      employerSalary.salary_history_employer_id = newEmployer.employer_id
      await employerSalaryRepository.save(employerSalary)
      
      return newEmployer
    },
    updateEmployer: async (_parent: unknown, { input }: { input: UpdateEmployerInput }, context: any): Promise<EmployerEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const employerRepository = AppDataSource.getRepository(EmployerEntity)

      let employer = await employerRepository.createQueryBuilder("employer")
        .where("employer.employer_id = :Id", { Id: input.employerId })
        .andWhere("employer.employer_branch_id = :id", { id: context.branchId })
        .andWhere("employer.employer_activated = true")
        .andWhere("employer.employer_deleted IS NULL")
        .getOne()

      if (!employer) throw new Error(`Bu Filialda bu hodim mavjud emas!`)
      let employerPermission = getChangedPermissions(permission, JSON.parse(input.employerPermission))

      employer.employer_name = input.employerName || employer.employer_name
      employer.employer_phone = input.employerPhone || employer.employer_phone
      employer.employer_birthday = new Date(input.employerBirthday) || employer.employer_birthday
      employer.employer_gender = Number(genderIndicator(input.employerGender)) || employer.employer_gender
      employer.employer_position = Number(positionIndicator(input.employerPosition)) || employer.employer_position
      employer.employer_password = input.employerPassword || employer.employer_password
      employer.permissions = employerPermission || employer.permissions
      let updateEmployer = await employerRepository.save(employer)

      return updateEmployer
    },
    updateEmployerProfile: async (_parent: unknown, { input }: { input: UpdateEmployerProfileInput }, context: any): Promise<EmployerEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const employerRepository = AppDataSource.getRepository(EmployerEntity)

      let employer = await employerRepository.createQueryBuilder("employer")
        .where("employer.employer_id = :Id", { Id: input.employerId })
        .andWhere("employer.employer_branch_id = :id", { id: context.branchId })
        .andWhere("employer.employer_activated = true")
        .andWhere("employer.employer_deleted IS NULL")
        .getOne()

      if (!employer) throw new Error(`Bu Filialda "${input.employerPhone}" raqamli hodim mavjud`)

      employer.employer_name = input.employerName || employer.employer_name
      employer.employer_phone = input.employerPhone || employer.employer_phone
      employer.employer_birthday = new Date(input.employerBirthday) || employer.employer_birthday
      employer.employer_gender = input.employerGender || employer.employer_gender
      employer.employer_usage_lang = input.employerLang || employer.employer_usage_lang
      return await employerRepository.save(employer)
    },
    deactivateEmployer: async (_parent: unknown, { employerId }: { employerId: string }, context: any): Promise<EmployerEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const employerRepository = AppDataSource.getRepository(EmployerEntity)
      let data = await employerRepository.createQueryBuilder("employer")
        .where("employer.employer_id = :id", { id: employerId })
        .andWhere("employer.employer_activated = true")
        .andWhere("employer.employer_deleted IS NULL")
        .getOne()
      
      if (!data) throw new Error(`Bu hodim mavjud emas`)
      data.employer_activated = false
      await employerRepository.save(data)
      return data
    },
    deleteEmployer: async (_parent: unknown, { employerId }: { employerId: string }, context: any): Promise<EmployerEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");

      const employerRepository = AppDataSource.getRepository(EmployerEntity)
      const employerSalaryRepository = AppDataSource.getRepository(SalaryEntity)
      let data = await employerRepository.createQueryBuilder("employer")
        .where("employer.employer_id = :id", { id: employerId })
        .andWhere("employer.employer_deleted IS NULL")
        .getOne()
      let dataSalary = await employerSalaryRepository.createQueryBuilder("salary")
        .where("salary.salary_history_employer_id = :id", { id: employerId })
        .andWhere("salary.salary_deleted IS NULL")
        .getOne()
      if (!data || !dataSalary) throw new Error(`Bu hodim mavjud emas`)

      
      dataSalary.salary_deleted = new Date()
      await employerSalaryRepository.save(dataSalary)

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
    employerPermission: (global: Employer) => JSON.stringify(global.permissions),
    employerBranchId: (global: Employer) => global.employer_branch_id,
  }
};

function employerPermissionByRole(str:string) {
  if (str == 'ceo') {
    return ['director', 'administrator', 'teacher', 'marketolog', 'casher']
  } else if (str == 'director') {
    return ['administrator', 'teacher', 'marketolog', 'casher']
  } else if (str == 'administrator') {
    return ['administrator', 'teacher']
  }
  return [] 
}

function getChangedPermissions(template: Permission, input: Permission = {}): Permission {
  const changed: Permission = {};

  for (const key in template) {
    if (typeof template[key] === 'object' && !Array.isArray(template[key])) {
      if (input[key] && typeof input[key] === 'object') {
        const nestedChanged = getChangedPermissions(template[key] as Permission, input[key] as Permission);
        if (Object.keys(nestedChanged).length > 0) {
          changed[key] = nestedChanged;
        }
      }
    } else if (input[key] === true && template[key] === false) {
      changed[key] = true;
    }
  }

  return changed;
}

export default resolvers;