import { IsNull } from "typeorm";
import AppDataSource from "../../config/ormconfig";
import FormsEntiry, { Form_Configs, Form_Funnels, Form_Items } from "../../entities/form.entity";
import { AddFormInput, Form } from "../../types/forms";
import initialData from './form_initial.json'

const picPath = `https://fastly.picsum.photos/id/1023/642/162.jpg?hmac=eCjsP_2wNbgk-TCxwLIPw0GiyZ_JWb8cVPrAJedczLw`

const resolvers = {
    Query: {
        forms: async (_parametr: unknown, {}, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const formRepository = AppDataSource.getRepository(FormsEntiry)
            return await formRepository.createQueryBuilder("form")
                .where("form.form_deleted IS NULL")
                .getMany()
        },
        formById: async (_parametr: unknown, { Id }: { Id: string }, context: any) => {
            if (!context?.branchId) throw new Error("Not exist access token!");
            const formRepository = AppDataSource.getRepository(FormsEntiry)
            return await formRepository.createQueryBuilder("form")
                .where("form.form_id = :Id", { Id })
                .andWhere("form.form_deleted IS NULL")
                .getOne()
        }
    },
    Mutation: {
        addForm: async (_parent: unknown, { input }: { input: AddFormInput }, context: any) => {
            try {
                if (!context?.branchId) throw new Error("Not exist access token!");
                const formRepository = AppDataSource.getRepository(FormsEntiry)

                let data = await formRepository.findOneBy({ form_name: input.formName, form_deleted: IsNull() })
                if (data !== null) throw new Error(`Bu nomli forma mavjud`)

                let form = new FormsEntiry()
                form.form_name = input.formName
                form.form_branch_id = context.branchId
                let newForm = await formRepository.save(form)

                const formConfigsRepository = AppDataSource.getRepository(Form_Configs)
                let formConfigs = new Form_Configs()
                formConfigs.form_id = newForm.form_id
                await formConfigsRepository.save(formConfigs)

                const funnels = input.Funnels

                if (funnels.length) {
                    const formFunnelRepository = AppDataSource.getRepository(Form_Funnels)
                    for (const i of funnels) {
                        let formFunnel = new Form_Funnels()
                        formFunnel.form_id = newForm.form_id
                        formFunnel.funnel_id = i
                        await formFunnelRepository.save(formFunnel)
                    }
                }

                if (input.formType == 'lead') {
                    const formItemsRepository = AppDataSource.getRepository(Form_Items)
                    let dataItemOrders = await formItemsRepository.createQueryBuilder("form")
                        .where("form.form_id = :formId", { formId: newForm.form_id })
                        .orderBy("form.form_item_order", "DESC")
                        .getMany()
                    let newOrder = dataItemOrders[0] && dataItemOrders[0]?.form_item_order ? dataItemOrders[0]?.form_item_order + 1 : 1

                    for (const i of initialData) {
                        let formItems = new Form_Items()
                        formItems.form_item_title = i.title
                        formItems.form_item_description = i.desc
                        formItems.form_item_type = i.type
                        formItems.form_item_required = i.required
                        formItems.form_item_order = newOrder
                        await formItemsRepository.save(formItems)
                        newOrder++
                    }
                }
                return newForm
            } catch (error) {
                console.log(error)
            }
        },
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
