type AddTaskInput = {
    taskTitle: string
    taskBody: string
    taskStartDate: string
    taskEndDate: string
    taskType: string
    taskFromColleagueId: string
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
}

export {
    Task,
    AddTaskInput
}