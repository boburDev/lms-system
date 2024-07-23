import { AddEmployerInput, Employer } from "../../types/employer";
import AppDataSource from "../../config/ormconfig";
import EmployerEntity from "../../entities/employer/employers.entity";
import positionIndicator, { getPermissions } from "../../utils/status_and_positions";
import permission from './employer_permission.json'
type Permission = {
  [key: string]: Permission | boolean;
};

// const input: Permission = {
//   "dashboard": {
//     "students_stat": { "isRead": true },
//     "colleaue_stat": { "isRead": true, "isAll": true },
//     "client_stat": { "isRead": false }
//   },
//   "leads": {
//     "funnels": {
//       "isCreate": false,
//       "isUpdate": true,
//       "isDelete": false,
//       "isRead": true
//     },
//     "columns": {
//       "isCreate": true,
//       "isUpdate": false,
//       "isDelete": false,
//       "isRead": false
//     },
//     "leads": {
//       "isCreate": false,
//       "isUpdate": false,
//       "isDelete": false,
//       "isRead": false,
//       "isExport": true,
//       "isImport": false
//     }
//   },
//   "settings": {
//     "add_branch": {
//       "isCreate": true,
//       "isUpdate": true,
//       "isDelete": true,
//       "isRead": true
//     }
//   }
// };

// const changedPermissions = getChangedPermissions(permission, input);
// // console.log(JSON.stringify(changedPermissions, null, 2));
// console.log(changedPermissions)


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
    employerPermissions: async (_parametr: unknown, { employerRole }: { employerRole: string }, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      let permissionByStatus = permission
      console.log(permissionByStatus)
      
      if (employerRole === 'teacher') {
        // console.log(getPermissions(employerRole, permissionByStatus));
        
      }


      return JSON.stringify(permissionByStatus)
    }
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

function getChangedPermissions(template: Permission, input: Permission): Permission {
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