import { AddEmployerInput, Employer, UpdateEmployerInput, UpdateEmployerProfileInput } from "../../types/employer";
import AppDataSource from "../../config/ormconfig";
import EmployerEntity from "../../entities/employer/employers.entity";
import positionIndicator, { genderIndicator, getPermissions } from "../../utils/status_and_positions";
import permission from './employer_permission.json'
import SalaryEntity from "../../entities/employer/salary.entity";
import { IsNull } from "typeorm";
import { getChanges } from "../../utils/eventRecorder";

export type Permission = {
  [key: string]: Permission | boolean;
};

const resolvers = {
  Query: {
    employers: async (_parametr: unknown, { }, context: any): Promise<EmployerEntity[]> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;

      try {
        const employerRepository = AppDataSource.getRepository(EmployerEntity)
        let data = await employerRepository.find({
          where: { employer_branch_id: context.branchId, employer_activated: true, employer_deleted: IsNull() },
          order: { employer_created: "DESC" }
        })
        return data
      } catch (error) {
        await catchErrors(error, 'employers', branchId);
        throw error;
      }
    },
    employerById: async (_parametr: unknown, input: { employerId: string }, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;

      try {
        const employerRepository = AppDataSource.getRepository(EmployerEntity)
        let data = await employerRepository.createQueryBuilder("employer")
          .where("employer.employer_id = :Id", { Id: input.employerId || context.colleagueId })
          .andWhere("employer.employer_branch_id = :id", { id: context.branchId })
          .andWhere("employer.employer_activated = true")
          .andWhere("employer.employer_deleted IS NULL")
          .getOne()
        if (!data) throw new Error(`Bu Filialda bu hodim mavjud emas`)
        return data
      } catch (error) {
        await catchErrors(error, 'employerById', branchId);
        throw error;
      }
    },
    employerRoles: async (_parametr: unknown, { }, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      if (['ceo', 'director', 'administrator'].includes(context.role)) return employerPermissionByRole(context.role)
      throw new Error("You don't have permission");
    },
    employerPermissions: async (_parametr: unknown, { employerRole }: { employerRole: string }, context: any) => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      if (['ceo', 'director', 'administrator'].includes(context.role)) {
        let permissions = getPermissions(employerRole, permission)
        if (permissions && permissions.error) throw new Error(permissions.message);
        return JSON.stringify(permissions)
      } else {
        throw new Error("You don't have permission");
      }
    }
  },
  Mutation: {
    addEmployer: async (_parent: unknown, { input }: { input: AddEmployerInput }, context: any): Promise<EmployerEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      if (!['ceo', 'director', 'administrator'].includes(context.role)) throw new Error("You don't have permission");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;
      const writeActions = context.writeActions;

      try {
        const employerRepository = AppDataSource.getRepository(EmployerEntity);

        let existingEmployer = await employerRepository.createQueryBuilder("employer")
          .where("employer.employer_phone = :phone", { phone: input.employerPhone })
          .andWhere("employer.employer_branch_id = :id", { id: context.branchId })
          .andWhere("employer.employer_activated = true")
          .andWhere("employer.employer_deleted IS NULL")
          .getOne();

        if (existingEmployer) throw new Error(`Bu Filialda "${input.employerPhone}" raqamli hodim mavjud`);
        let employerPermission = getChangedPermissions(permission, JSON.parse(input.employerPermission));

        let employer = new EmployerEntity();
        employer.employer_name = input.employerName;
        employer.employer_phone = input.employerPhone;
        if (!isNaN(new Date(input.employerBirthday).getTime())) {
          employer.employer_birthday = new Date(input.employerBirthday);
        }
        employer.employer_gender = Number(genderIndicator(input.employerGender)) || null;
        employer.employer_position = Number(positionIndicator(input.employerPosition));
        employer.employer_password = input.employerPassword;
        employer.permissions = employerPermission;
        employer.employer_branch_id = context.branchId;

        let newEmployer = await employerRepository.save(employer);

        // Log each field of the newly created employer
        const employerChanges = getChanges({}, newEmployer, [
          "employer_name",
          "employer_phone",
          "employer_birthday",
          "employer_gender",
          "employer_position",
          "employer_password",
          "permissions",
          "employer_branch_id"
        ]);

        for (const change of employerChanges) {
          await writeActions({
            objectId: newEmployer.employer_id,
            eventType: 1,
            eventBefore: change.before,
            eventAfter: change.after,
            eventObject: "Employer",
            eventObjectName: change.field,
            employerId: context.colleagueId || "",
            employerName: context.colleagueName || "",
            branchId: context.branchId || "",
          });
        }

        return newEmployer;
      } catch (error) {
        await catchErrors(error, 'addEmployer', branchId, input);
        throw error;
      }
    },
    updateEmployer: async (_parent: unknown, { input }: { input: UpdateEmployerInput }, context: any): Promise<EmployerEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      if (!['ceo', 'director', 'administrator'].includes(context.role)) throw new Error("You don't have permission");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;
      const writeActions = context.writeActions;

      try {
        const employerRepository = AppDataSource.getRepository(EmployerEntity);

        let employer = await employerRepository.createQueryBuilder("employer")
          .where("employer.employer_id = :Id", { Id: input.employerId })
          .andWhere("employer.employer_branch_id = :id", { id: context.branchId })
          .andWhere("employer.employer_activated = true")
          .andWhere("employer.employer_deleted IS NULL")
          .getOne();

        if (!employer) throw new Error(`Bu Filialda bu hodim mavjud emas!`);

        const originalEmployer = { ...employer };
        let employerPermission = getChangedPermissions(permission, JSON.parse(input.employerPermission || '{}'));

        // Apply updates
        employer.employer_name = input.employerName || employer.employer_name;
        employer.employer_phone = input.employerPhone || employer.employer_phone;
        employer.employer_birthday = new Date(input.employerBirthday) || employer.employer_birthday;
        employer.employer_gender = Number(genderIndicator(input.employerGender)) || employer.employer_gender;
        employer.employer_position = Number(positionIndicator(input.employerPosition)) || employer.employer_position;
        employer.employer_password = input.employerPassword || employer.employer_password;
        employer.permissions = employerPermission || employer.permissions;

        let updatedEmployer = await employerRepository.save(employer);

        // Log each change in the updated employer entity
        const employerChanges = getChanges(originalEmployer, updatedEmployer, [
          "employer_name",
          "employer_phone",
          "employer_birthday",
          "employer_gender",
          "employer_position",
          "employer_password",
          "permissions"
        ]);

        for (const change of employerChanges) {
          await writeActions({
            objectId: updatedEmployer.employer_id,
            eventType: 2,
            eventBefore: change.before,
            eventAfter: change.after,
            eventObject: "Employer",
            eventObjectName: change.field,
            employerId: context.colleagueId || "",
            employerName: context.colleagueName || "",
            branchId: context.branchId || ""
          });
        }

        return updatedEmployer;
      } catch (error) {
        await catchErrors(error, 'updateEmployer', branchId, input);
        throw error;
      }
    },
    updateEmployerProfile: async (_parent: unknown, { input }: { input: UpdateEmployerProfileInput }, context: any): Promise<EmployerEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;
      const writeActions = context.writeActions;

      try {
        const employerRepository = AppDataSource.getRepository(EmployerEntity);

        let employer = await employerRepository.createQueryBuilder("employer")
          .where("employer.employer_id = :Id", { Id: input.employerId })
          .andWhere("employer.employer_branch_id = :id", { id: context.branchId })
          .andWhere("employer.employer_activated = true")
          .andWhere("employer.employer_deleted IS NULL")
          .getOne();

        if (!employer) throw new Error(`Bu Filialda "${input.employerPhone}" raqamli hodim mavjud`);

        const originalProfile = { ...employer };

        // Update fields
        employer.employer_name = input.employerName || employer.employer_name;
        employer.employer_phone = input.employerPhone || employer.employer_phone;
        employer.employer_birthday = new Date(input.employerBirthday) || employer.employer_birthday;
        employer.employer_gender = input.employerGender || employer.employer_gender;
        employer.employer_usage_lang = input.employerLang || employer.employer_usage_lang;

        let updatedProfile = await employerRepository.save(employer);

        // Log profile updates
        const profileChanges = getChanges(originalProfile, updatedProfile, [
          "employer_name",
          "employer_phone",
          "employer_birthday",
          "employer_gender",
          "employer_usage_lang"
        ]);

        for (const change of profileChanges) {
          await writeActions({
            objectId: updatedProfile.employer_id,
            eventType: 2,
            eventBefore: change.before,
            eventAfter: change.after,
            eventObject: "EmployerProfile",
            eventObjectName: change.field,
            employerId: context.colleagueId || "",
            employerName: context.colleagueName || "",
            branchId: context.branchId || ""
          });
        }

        return updatedProfile;
      } catch (error) {
        await catchErrors(error, 'updateEmployerProfile', branchId, input);
        throw error;
      }
    },
    deactivateEmployer: async (_parent: unknown, { employerId }: { employerId: string }, context: any): Promise<EmployerEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      if (!['ceo', 'director', 'administrator'].includes(context.role)) throw new Error("You don't have permission");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;
      const writeActions = context.writeActions;

      try {
        const employerRepository = AppDataSource.getRepository(EmployerEntity);
        let employer = await employerRepository.createQueryBuilder("employer")
          .where("employer.employer_id = :id", { id: employerId })
          .andWhere("employer.employer_activated = true")
          .andWhere("employer.employer_deleted IS NULL")
          .getOne();

        if (!employer) throw new Error(`Bu hodim mavjud emas`);
        employer.employer_activated = false;
        await employerRepository.save(employer);

        // Log deactivation
        await writeActions({
          objectId: employer.employer_id,
          eventType: 2,
          eventBefore: "true",
          eventAfter: "false",
          eventObject: "Employer",
          eventObjectName: "deactivateEmployer",
          employerId: context.colleagueId || "",
          employerName: context.colleagueName || "",
          branchId: context.branchId || ""
        });

        return employer;
      } catch (error) {
        await catchErrors(error, 'deactivateEmployer', branchId, employerId);
        throw error;
      }
    },
    deleteEmployer: async (_parent: unknown, { employerId }: { employerId: string }, context: any): Promise<EmployerEntity> => {
      if (!context?.branchId) throw new Error("Not exist access token!");
      if (!['ceo', 'director', 'administrator'].includes(context.role)) throw new Error("You don't have permission");
      const catchErrors = context.catchErrors;
      const branchId = context.branchId;
      const writeActions = context.writeActions;

      try {
        const employerRepository = AppDataSource.getRepository(EmployerEntity);
        const employerSalaryRepository = AppDataSource.getRepository(SalaryEntity);

        let employer = await employerRepository.createQueryBuilder("employer")
          .where("employer.employer_id = :id", { id: employerId })
          .andWhere("employer.employer_deleted IS NULL")
          .getOne();
        let salary = await employerSalaryRepository.createQueryBuilder("salary")
          .where("salary.salary_history_employer_id = :id", { id: employerId })
          .andWhere("salary.salary_deleted IS NULL")
          .getOne();

        if (!employer || !salary) throw new Error(`Bu hodim mavjud emas`);

        salary.salary_deleted = new Date();
        await employerSalaryRepository.save(salary);

        employer.employer_deleted = new Date();
        await employerRepository.save(employer);

        // Log deletion
        await writeActions({
          objectId: employer.employer_id,
          eventType: 3,
          eventBefore: JSON.stringify(employer),
          eventAfter: "",
          eventObject: "Employer",
          eventObjectName: "deleteEmployer",
          employerId: context.colleagueId || "",
          employerName: context.colleagueName || "",
          branchId: context.branchId || ""
        });

        return employer;
      } catch (error) {
        await catchErrors(error, 'deleteEmployer', branchId, employerId);
        throw error;
      }
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

function employerPermissionByRole(str: string) {
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