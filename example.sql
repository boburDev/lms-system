\c postgres
drop database crm;
CREATE DATABASE crm;
\c crm

ALTER USER postgres WITH PASSWORD 'bobur1907';

drop table company_branches, costs, courses, employers, group_attendences,
groups, rooms, student_cashes, student_payments, students cascade;


    @Column({ nullable: false })
    students_count: number

    @Column({ nullable: false })
    left_students_count: number
    
    @Column({ nullable: false })
    added_students_count: number
    
    @Column({ nullable: false })
    groups_count: number