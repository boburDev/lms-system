import AppDataSource from "../../config/ormconfig";
import { AddTaskInput, Task } from "../../types/tasks";
import TasksEntity from "../../entities/tasks.entity";

const resolvers = {
    Query: {
        tasks: async (_parametr: unknown, { }, context: any): Promise<TasksEntity[]> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const tasksRepository = AppDataSource.getRepository(TasksEntity)
            return await tasksRepository.find({
                where: { task_branch_id: context.branchId },
                order: { task_created: "DESC" }
            })
        }
    },
    Mutation: {
        addTask: async (_parent: unknown, { input }: { input: AddTaskInput }, context: any): Promise<TasksEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const taskRepository = AppDataSource.getRepository(TasksEntity)

            let task = new TasksEntity()
            task.task_title = input.taskTitle
            task.task_body = input.taskBody
            task.task_start_date = new Date(input.taskStartDate)
            task.task_end_date = new Date(input.taskEndDate)
            task.task_type = +input.taskType
            task.colleague_id_task_from = input.taskFromColleagueId
            task.colleague_id = context.colleagueId
            task.task_branch_id = context.branchId

            return await taskRepository.save(task)
        }
    },
    Task: {
        taskId: (global: Task) => global.task_id,
        taskTitle: (global: Task) => global.task_title,
        taskBody: (global: Task) => global.task_body,
        taskStartDate: (global: Task) => global.task_start_date,
        taskEndDate: (global: Task) => global.task_end_date,
        taskType: (global: Task) => global.task_type,
        taskFromColleagueId: (global: Task) => global.colleague_id_task_from,
        taskColleagueId: (global: Task) => global.colleague_id,
    }
}

export default resolvers;