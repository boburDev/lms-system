import { ActivateStudentGroupInput, AddStudentGroupInput, ChangeStudentGroupDateInput, DeleteStudentGroupInput, FreezeStudentGroupInput, UpdateStudentAddedGroupDateInput } from "../../../types/group";
import AppDataSource from "../../../config/ormconfig";
import StudentGroups, { StudentAttendences } from "../../../entities/student/student_groups.entity";
import GroupEntity, { GroupAttendences } from "../../../entities/group/groups.entity";
import Groups from "../../../entities/group/groups.entity";
import { getDays } from "../../../utils/date";
import { getChanges } from "../../../utils/eventRecorder";

const resolvers = {
    Mutation: {
        activateStudentGroup: async (_parent: unknown, { input }: { input: ActivateStudentGroupInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const studentGroupRepository = AppDataSource.getRepository(StudentGroups);
                let data = await studentGroupRepository.findOne({
                    where: { student_id: input.studentId, group_id: input.groupId, student_group_status: 4 }
                });
                if (!data) throw new Error("User is already activated or Group not found");

                const originalData = { ...data };
                data.student_group_status = 1; // Example activation status
                await studentGroupRepository.save(data);

                const changes = getChanges(originalData, data, ["student_group_status"]);
                for (const change of changes) {
                    await writeActions({
                        objectId: data.group_id,
                        eventType: 2,
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "StudentGroups",
                        eventObjectName: change.field,
                        employerId: context.colleagueId,
                        employerName: context.colleagueName,
                        branchId: branchId,
                    });
                }

                return 'success';
            } catch (error) {
                await catchErrors(error, 'activateStudentGroup', branchId, input);
                throw error;
            }
        },
        addStudentGroup: async (_parent: unknown, { input }: { input: AddStudentGroupInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const studentGroupRepository = AppDataSource.getRepository(StudentGroups);
                const newStudentGroup = new StudentGroups();
                newStudentGroup.student_group_add_time = new Date(input.addedDate);
                newStudentGroup.student_group_lesson_end = new Date(); // Set as appropriate
                newStudentGroup.student_id = input.studentId;
                newStudentGroup.group_id = input.groupId;
                newStudentGroup.student_group_status = 4;

                await studentGroupRepository.save(newStudentGroup);

                const changes = getChanges({}, newStudentGroup, ["student_group_add_time", "student_group_lesson_end", "student_id", "group_id", "student_group_status"]);
                for (const change of changes) {
                    await writeActions({
                        objectId: newStudentGroup.group_id,
                        eventType: 1,
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "StudentGroups",
                        eventObjectName: change.field,
                        employerId: context.colleagueId,
                        employerName: context.colleagueName,
                        branchId: branchId,
                    });
                }

                return 'succeed';
            } catch (error) {
                await catchErrors(error, 'addStudentGroup', branchId, input);
                throw error;
            }
        },
        freezeStudentGroup: async (_parent: unknown, { input }: { input: FreezeStudentGroupInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const studentGroupRepository = AppDataSource.getRepository(StudentGroups);
                const data = await studentGroupRepository.findOne({
                    where: { student_id: input.studentId, group_id: input.groupId }
                });
                if (!data) throw new Error("Student group not found");

                const originalData = { ...data };
                data.student_group_status = 10; // Freezing status

                await studentGroupRepository.save(data);

                const changes = getChanges(originalData, data, ["student_group_status"]);
                for (const change of changes) {
                    await writeActions({
                        objectId: data.group_id,
                        eventType: 2,
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "StudentGroups",
                        eventObjectName: change.field,
                        employerId: context.colleagueId,
                        employerName: context.colleagueName,
                        branchId: branchId,
                    });
                }

                return 'success';
            } catch (error) {
                await catchErrors(error, 'freezeStudentGroup', branchId, input);
                throw error;
            }
        },
        updateStudentAddedGroupDate: async (_parent: unknown, { input }: { input: UpdateStudentAddedGroupDateInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const studentGroupRepository = AppDataSource.getRepository(StudentGroups);
                const data = await studentGroupRepository.findOne({
                    where: { student_id: input.studentId, group_id: input.groupId }
                });
                if (!data) throw new Error("Student group not found");

                const originalData = { ...data };
                data.student_group_add_time = new Date(input.addedDate);

                await studentGroupRepository.save(data);

                const changes = getChanges(originalData, data, ["student_group_add_time"]);
                for (const change of changes) {
                    await writeActions({
                        objectId: data.group_id,
                        eventType: 2,
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "StudentGroups",
                        eventObjectName: change.field,
                        employerId: context.colleagueId,
                        employerName: context.colleagueName,
                        branchId: branchId,
                    });
                }

                return 'success';
            } catch (error) {
                await catchErrors(error, 'updateStudentAddedGroupDate', branchId, input);
                throw error;
            }
        },
        changeStudentGroup: async (_parent: unknown, { input }: { input: ChangeStudentGroupDateInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const studentGroupRepository = AppDataSource.getRepository(StudentGroups);
                const oldData = await studentGroupRepository.findOne({
                    where: { student_id: input.studentId, group_id: input.fromGroupId }
                });
                if (!oldData) throw new Error("Student group not found");

                const originalData = { ...oldData };
                oldData.student_group_status = 6; // Status for group change

                await studentGroupRepository.save(oldData);

                const newData = new StudentGroups();
                newData.student_group_add_time = new Date(input.addedDate);
                newData.student_id = input.studentId;
                newData.group_id = input.toGroupId;
                newData.student_group_status = 4;

                await studentGroupRepository.save(newData);

                const oldChanges = getChanges(originalData, oldData, ["student_group_status"]);
                for (const change of oldChanges) {
                    await writeActions({
                        objectId: oldData.group_id,
                        eventType: 2,
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "StudentGroups",
                        eventObjectName: change.field,
                        employerId: context.colleagueId,
                        employerName: context.colleagueName,
                        branchId: branchId,
                    });
                }

                const newChanges = getChanges({}, newData, ["student_group_add_time", "group_id", "student_group_status"]);
                for (const change of newChanges) {
                    await writeActions({
                        objectId: newData.group_id,
                        eventType: 1,
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "StudentGroups",
                        eventObjectName: change.field,
                        employerId: context.colleagueId,
                        employerName: context.colleagueName,
                        branchId: branchId,
                    });
                }

                return 'succeed';
            } catch (error) {
                await catchErrors(error, 'changeStudentGroup', branchId, input);
                throw error;
            }
        },

        deleteStudentGroup: async (_parent: unknown, { input }: { input: DeleteStudentGroupInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;

            try {
                const studentGroupRepository = AppDataSource.getRepository(StudentGroups);
                const data = await studentGroupRepository.findOne({
                    where: { student_id: input.studentId, group_id: input.groupId }
                });
                if (!data) throw new Error("Student group not found");

                const originalData = { ...data };
                data.student_group_status = 7; // Status for deletion

                await studentGroupRepository.save(data);

                const changes = getChanges(originalData, data, ["student_group_status"]);
                for (const change of changes) {
                    await writeActions({
                        objectId: data.group_id,
                        eventType: 3,
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "StudentGroups",
                        eventObjectName: 'deleteStudentGroup',
                        employerId: context.colleagueId,
                        employerName: context.colleagueName,
                        branchId: branchId,
                    });
                }

                return 'success';
            } catch (error) {
                await catchErrors(error, 'deleteStudentGroup', branchId, input);
                throw error;
            }
        }
    },
}

export default resolvers;