\c postgres
drop database crm1;
CREATE DATABASE crm1;
\c crm1

ALTER USER postgres WITH PASSWORD 'bobur1907';

drop table company_branches, costs, courses, employers, group_attendences,
groups, rooms, student_cashes, student_payments, students cascade;
