type AddFormInput = {
    formName: string
    formType: string
    Funnels: [string]
}

type Form = {
    form_id: string
    form_name: string
}
export {
    AddFormInput,
    Form
}
