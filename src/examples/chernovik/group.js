data = await groupRepository.findOne({
    where: {
        group_branch_id: context.branchId,
        group_id: input.Id,
    },
    relations: ['attendence', 'employer', 'room', 'course']
})