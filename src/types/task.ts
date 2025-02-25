type AddTaskInput = {
    taskTitle: string
    taskBody: string
    taskStartDate: string
    taskEndDate: string
    taskType: string
    taskToColleagueId: string
}

type UpdateTaskInput = {
    taskId: string
    taskTitle: string
    taskBody: string
    taskStartDate: string
    taskEndDate: string
    taskType: string
    taskFromColleagueId: string
    taskToColleagueId: string
}

type Task = {
    task_id: string,
    task_title: string
    task_body: string
    task_start_date: string
    task_end_date: string
    task_type: string
    colleague_id: string
    colleague_id_task_from: string
    taskToColleagueName: string
    colleague_task_from: {
        employer_name: string
    }
    colleague_task: {
        employer_name: string
    }
}

export {
    Task,
    AddTaskInput,
    UpdateTaskInput
}