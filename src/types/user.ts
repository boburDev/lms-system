type AddUserInput = {
    name: String
    email: String
    role: String
}

type User = {
    id: String,
    name: String,
    email: String,
    role: String
}


export {
    User,
    AddUserInput
}