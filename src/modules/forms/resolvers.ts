import { IsNull } from "typeorm";
import AppDataSource from "../../config/ormconfig";
import FormsEntiry, { FormConfigs, FormFunnels, FormItems } from "../../entities/form.entity";
import { AddFormInput, Form } from "../../types/forms";
import initialData from './form_initial.json'
import { getChanges } from "../../utils/eventRecorder";

const picPath = `https://fastly.picsum.photos/id/1023/642/162.jpg?hmac=eCjsP_2wNbgk-TCxwLIPw0GiyZ_JWb8cVPrAJedczLw`

const resolvers = {
    Query: {
        forms: async (_parametr: unknown, { }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            try {
                const formRepository = AppDataSource.getRepository(FormsEntiry)
                return await formRepository.createQueryBuilder("form")
                    .where("form.form_deleted IS NULL")
                    .getMany()
            } catch (error) {
                await catchErrors(error, 'forms', branchId);
                throw error;
            }

        },
        formById: async (_parametr: unknown, { Id }: { Id: string }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId

            try {
                const formRepository = AppDataSource.getRepository(FormsEntiry)
                return await formRepository.createQueryBuilder("form")
                    .where("form.form_id = :Id", { Id })
                    .andWhere("form.form_deleted IS NULL")
                    .getOne()
            } catch (error) {
                await catchErrors(error, 'formById', branchId);
                throw error;
            }

        }
    },
    Mutation: {
        addForm: async (_parent: unknown, { input }: { input: AddFormInput }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const catchErrors = context.catchErrors;
            const branchId = context.branchId;
            const writeActions = context.writeActions;
        
            try {
                const formRepository = AppDataSource.getRepository(FormsEntiry);
        
                // Check for existing form with the same name
                let existingForm = await formRepository.findOneBy({ form_name: input.formName, form_deleted: IsNull() });
                if (existingForm) throw new Error(`Bu nomli forma mavjud`);
        
                // Create new form
                let form = new FormsEntiry();
                form.form_name = input.formName;
                form.form_branch_id = context.branchId;
                let newForm = await formRepository.save(form);
        
                // Log new form creation
                const formChanges = getChanges({}, newForm, ["form_name", "form_branch_id"]);
                for (const change of formChanges) {
                    await writeActions({
                        objectId: newForm.form_id,
                        eventType: 1,
                        eventBefore: change.before,
                        eventAfter: change.after,
                        eventObject: "Form",
                        eventObjectName: change.field,
                        employerId: context.colleagueId || "",
                        employerName: context.colleagueName || "",
                        branchId: context.branchId || "",
                    });
                }
        
                // Create form configuration
                const formConfigsRepository = AppDataSource.getRepository(FormConfigs);
                let formConfig = new FormConfigs();
                formConfig.form_id = newForm.form_id;
                let newFormConfig = await formConfigsRepository.save(formConfig);
        
                // Log form configuration creation
                await writeActions({
                    objectId: newFormConfig.form_config_id,
                    eventType: 1,
                    eventBefore: "", // No "before" state for creation
                    eventAfter: JSON.stringify(newFormConfig),
                    eventObject: "FormConfig",
                    eventObjectName: "form_config",
                    employerId: context.colleagueId || "",
                    employerName: context.colleagueName || "",
                    branchId: context.branchId || ""
                });
        
                // Process and log each funnel in the input
                const funnels = input.Funnels;
                if (funnels.length) {
                    const formFunnelRepository = AppDataSource.getRepository(FormFunnels);
                    for (const funnelId of funnels) {
                        let formFunnel = new FormFunnels();
                        formFunnel.form_id = newForm.form_id;
                        formFunnel.funnel_id = funnelId;
                        let newFormFunnel = await formFunnelRepository.save(formFunnel);
        
                        // Log each form funnel creation
                        await writeActions({
                            objectId: newFormFunnel.form_funnel_id,
                            eventType: 1,
                            eventBefore: "",
                            eventAfter: JSON.stringify(newFormFunnel),
                            eventObject: "FormFunnels",
                            eventObjectName: "funnel_id",
                            employerId: context.colleagueId || "",
                            employerName: context.colleagueName || "",
                            branchId: context.branchId || ""
                        });
                    }
                }
        
                // Create initial form items if the form type is 'lead'
                if (input.formType === 'lead') {
                    const formItemsRepository = AppDataSource.getRepository(FormItems);
                    let dataItemOrders = await formItemsRepository.createQueryBuilder("form")
                        .where("form.form_id = :formId", { formId: newForm.form_id })
                        .orderBy("form.form_item_order", "DESC")
                        .getMany();
                    let newOrder = dataItemOrders[0]?.form_item_order ? dataItemOrders[0].form_item_order + 1 : 1;
        
                    for (const item of initialData) {
                        let formItem = new FormItems();
                        formItem.form_item_title = item.title;
                        formItem.form_item_description = item.desc;
                        formItem.form_item_type = item.type;
                        formItem.form_item_required = item.required;
                        formItem.form_item_order = newOrder;
                        formItem.form_id = newForm.form_id;
                        let newFormItem = await formItemsRepository.save(formItem);
        
                        // Log each form item creation
                        await writeActions({
                            objectId: newFormItem.form_item_id,
                            eventType: 1,
                            eventBefore: "",
                            eventAfter: JSON.stringify(newFormItem),
                            eventObject: "FormItems",
                            eventObjectName: "form_item",
                            employerId: context.colleagueId || "",
                            employerName: context.colleagueName || "",
                            branchId: context.branchId || ""
                        });
                        newOrder++;
                    }
                }
        
                return newForm;
            } catch (error) {
                await catchErrors(error, 'addForm', branchId, input);
                throw error;
            }
        }
        ,
    },
    Form: {
        formId: (global: Form) => global.form_id,
        formTitle: (global: Form) => global.form_name,
    }
}

export default resolvers;


// [
//     {
//         "title": "intro",
//         "desc": "desc",
//         "type": "header",
//         "required": true,
//         "input_value": ""
//     },
//     {
//         "title": "name",
//         "desc": "",
//         "type": "input",
//         "required": true,
//         "input_value": ""
//     },
//     {
//         "title": "phone",
//         "desc": "",
//         "type": "textarea",
//         "required": true,
//         "input_value": ""
//     },
//     {
//         "title": "choose_course",
//         "desc": "",
//         "type": "select",
//         "required": false,
//         "input_value": [{ "id": 1, "name": "english" }]
//     },
//     {
//         "title": "comment",
//         "desc": "",
//         "type": "textarea",
//         "required": false,
//         "input_value": ""
//     }
// ]
