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


    insert into countries(country_name) values('Uzbekistan') RETURNING *;

    insert into regions(region_name, country_id) 
	values('Tashkent', '48ade4f5-5da1-4de3-b398-862dc007bc20'),
		  ('Samarqand', '48ade4f5-5da1-4de3-b398-862dc007bc20'),
		  ('Bukhara', '48ade4f5-5da1-4de3-b398-862dc007bc20'),
		  ('Qashqadaryo', '48ade4f5-5da1-4de3-b398-862dc007bc20'),
		  ('Fargona', '48ade4f5-5da1-4de3-b398-862dc007bc20'),
		  ('Andijon', '48ade4f5-5da1-4de3-b398-862dc007bc20'),
		  ('Namangan', '48ade4f5-5da1-4de3-b398-862dc007bc20'),
		  ('Xorazm', '48ade4f5-5da1-4de3-b398-862dc007bc20'),
		  ('Navoi', '48ade4f5-5da1-4de3-b398-862dc007bc20'),
		  ('Surxandaryo', '48ade4f5-5da1-4de3-b398-862dc007bc20'),
		  ('Jizzax', '48ade4f5-5da1-4de3-b398-862dc007bc20'),
		  ('Termez', '48ade4f5-5da1-4de3-b398-862dc007bc20') RETURNING *;

          insert into districts(district_name, region_id) 
	values('Yunusabot', '2f3038d9-9f78-405b-bc09-420d1a77fab5') RETURNING *;