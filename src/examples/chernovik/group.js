data = await groupRepository.findOne({
    where: {
        group_branch_id: context.branchId,
        group_id: input.Id,
    },
    relations: ['attendence', 'employer', 'room', 'course']
})


    (async () => {
        let response = await fetch("http://api.uz-fox.uz/auth/login", {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                userphone: "998998616951",
                password: "111111",
                subdomain: "soffit"
            }),
        });
        console.log(await response.json());
    })();
