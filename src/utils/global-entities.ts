import AppDataSource from "../config/ormconfig";
import ErrorHandlings from "../entities/error_handling.entity";
import EventActions from "../entities/event_action.entity";

export async function catchErrors(error: unknown, funcName: string, branchId?: string, args?: string) {
    const errorCatchingRepository = AppDataSource.getRepository(ErrorHandlings)
    let err = (error as Error)

    let newError = new ErrorHandlings()
    newError.error_type = err.name
    newError.error_inputs = JSON.stringify(args) || ''
    newError.error_message = err.message
    newError.error_function_name = funcName
    newError.error_body = JSON.stringify(err)
    newError.error_branch_id = branchId || ''
    await errorCatchingRepository.save(newError)
}

export type Action = {
    objectId: string
    eventType: number
    eventBefore: string
    eventAfter: string
    eventObject: string
    eventObjectName: string,
    employerId: string
    employerName: string
    branchId: string
}

export async function writeActions(args: Action) {
    const writeActionRepository = AppDataSource.getRepository(EventActions)
    let newAction = new EventActions()
    newAction.object_id = args.objectId
    newAction.event_action_type = args.eventType
    newAction.event_action_before = args.eventBefore
    newAction.event_action_after = args.eventAfter
    newAction.event_action_object = args.eventObject
    newAction.event_action_object_name = args.eventObjectName
    newAction.branch_id = args.branchId
    console.log(newAction)
    
    // await writeActionRepository.save(newAction)
}