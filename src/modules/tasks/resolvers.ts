import AppDataSource from "../../config/ormconfig";
import { AddTaskInput, Task, UpdateTaskInput } from "../../types/task";
import TasksEntity from "../../entities/tasks.entity";
import EmployersEntity from "../../entities/employer/employers.entity";

const resolvers = {
    Query: {
        tasks: async (_parametr: unknown, { }, context: any): Promise<TasksEntity[]> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const tasksRepository = AppDataSource.getRepository(TasksEntity)
            return await tasksRepository.createQueryBuilder("task")
                .leftJoinAndSelect("task.colleague_task_from", "employer_from")
                .leftJoinAndSelect("task.colleague_task", "employer_to")
                .where("task.task_branch_id = :branchId", { branchId: context.branchId })
                .andWhere("task.task_deleted IS NULL")
                .getMany();
        },
        taskById: async (_parametr: unknown, { Id }: { Id: string }, context: any): Promise<TasksEntity | null> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const tasksRepository = AppDataSource.getRepository(TasksEntity)
            return await tasksRepository.createQueryBuilder("task")
                .where("task.task_branch_id = :branchId", { branchId: context.branchId })
                .andWhere("task.task_id = :Id", { Id })
                .andWhere("task.task_deleted IS NULL")
                .orderBy("task.task_created", "DESC")
                .getOne();
        }
    },
    Mutation: {
        addTask: async (_parent: unknown, { input }: { input: AddTaskInput }, context: any): Promise<TasksEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const taskRepository = AppDataSource.getRepository(TasksEntity)
            const employerRepository = AppDataSource.getRepository(EmployersEntity)

            let task = new TasksEntity()
            task.task_title = input.taskTitle
            task.task_body = input.taskBody
            if (input.taskEndDate) {
                task.task_end_date = new Date(input.taskEndDate)
            }
            task.task_type = +input.taskType || 1
            task.colleague_id_task_from = context.colleagueId
            if (input.taskToColleagueId) {
                task.colleague_id = input.taskToColleagueId
            }
            task.task_branch_id = context.branchId

            let employerId = { id1: input.taskToColleagueId, id2: context.colleagueId }
            const employers = await employerRepository.createQueryBuilder('employer')
                .where('employer.employer_id = :id1 OR employer.employer_id = :id2', employerId)
                .getMany();
            
            let taskToColleagueName = employers.find(i => i.employer_id == input.taskToColleagueId)?.employer_name
            let taskFromColleagueName = employers.find(i => i.employer_id == context.colleagueId)?.employer_name
            let result:any = {
                ...await taskRepository.save(task),
                colleague_task_from: { employer_name: taskToColleagueName },
                colleague_task: { employer_name: taskFromColleagueName }
            }
            return result
        },
        updateTask: async (_parent: unknown, { input }: { input: UpdateTaskInput }, context: any): Promise<TasksEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const taskRepository = AppDataSource.getRepository(TasksEntity)
            const employerRepository = AppDataSource.getRepository(EmployersEntity)

            let task = await taskRepository.createQueryBuilder("task")
                .where("task.task_branch_id = :branchId", { branchId: context.branchId })
                .andWhere("task.task_id = :taskId", { taskId: input.taskId })
                .andWhere("task.task_deleted IS NULL")
                .orderBy("task.task_created", "DESC")
                .getOne();
            if (!task) throw new Error("Task not found");

            task.task_title = input.taskTitle || task.task_title
            task.task_body = input.taskBody || task.task_body
            task.task_end_date = new Date(input.taskEndDate) || task.task_end_date
            task.task_type = +input.taskType || task.task_type
            task.colleague_id_task_from = input.taskFromColleagueId || task.colleague_id_task_from
            task.colleague_id = input.taskToColleagueId || task.colleague_id
            task = await taskRepository.save(task)

            let employerId = { id1: input.taskToColleagueId, id2: context.colleagueId }
            const employers = await employerRepository.createQueryBuilder('employer')
                .where('employer.employer_id = :id1 OR employer.employer_id = :id2', employerId)
                .getMany();

            let taskToColleagueName = employers.find(i => i.employer_id == input.taskToColleagueId)?.employer_name
            let taskFromColleagueName = employers.find(i => i.employer_id == context.colleagueId)?.employer_name

            let result: any = {
                ...task,
                colleague_task_from: { employer_name: taskToColleagueName },
                colleague_task: { employer_name: taskFromColleagueName }
            }
            return result
        },
        deleteTask: async (_parent: unknown, { taskId }: { taskId: string }, context: any): Promise<TasksEntity> => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const taskRepository = AppDataSource.getRepository(TasksEntity)

            let data = await taskRepository.createQueryBuilder("task")
                .where("task.task_id = :id", { id: taskId })
                .andWhere("task.task_deleted IS NULL")
                .getOne()

            if (data === null) throw new Error(`Bu vazifa mavjud emas`)
            data.task_deleted = new Date()
            await taskRepository.save(data)
            return data
        }
    },
    Task: {
        taskId: (global: Task) => global.task_id,
        taskTitle: (global: Task) => global.task_title,
        taskBody: (global: Task) => global.task_body,
        taskEndDate: (global: Task) => global?.task_end_date,
        taskType: (global: Task) => global.task_type,
        taskColleagueId: (global: Task) => global.colleague_id,
        taskColleagueName: (global: Task) => global.colleague_task?.employer_name,
        taskFromColleagueId: (global: Task) => global.colleague_id_task_from,
        taskFromColleagueName: (global: Task) => global.colleague_task_from?.employer_name,
    }
}

export default resolvers;