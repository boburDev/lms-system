import AppDataSource from "../config/ormconfig";
import ErrorHandlings from "../entities/error_handling.entity";
import EventActions from "../entities/event_action.entity";

export async function catchErrors(input: any) {
    const errorCatchingRepository = AppDataSource.getRepository(ErrorHandlings)

    let newError = new ErrorHandlings()
    newError.error_type = input.type
    newError.error_inputs = input.inputs
    newError.error_message = input.message
    newError.error_function_name = input.funcName
    newError.error_body = JSON.stringify(input.body)
    newError.error_branch_id = input.branchId
    await errorCatchingRepository.save(newError)
}

export async function writeActions(input: any) {
    const writeActionRepository = AppDataSource.getRepository(EventActions)

    let newAction = new EventActions()
    // newAction.error_type = input.type
    // newAction.error_function_name = input.funcName
    // newAction.error_message = input.message
    // newAction.error_body = JSON.stringify(input.body)
    // newAction.error_branch_id = input.branchId
    await writeActionRepository.save(newAction)
}