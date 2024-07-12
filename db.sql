create table payme_payment (
	payment_id varchar not null,
	payment_state int not null default 1,
	payment_ammount int not null,
	perform_time bigint default 0,
	cancel_time bigint default 0,
	payment_reason int,
	created_at timestamp default current_timestamp,
	company_branch_id uuid not null references company_branches(company_branch_id) on delete cascade
);

create table funnel_permission (
	funnel_permission_id uuid not null default uuid_generate_v4() primary key,
	company_colleague_id uuid  references company_colleagues(company_colleague_id) on delete cascade,
	company_funnel_id uuid references company_funnels(company_funnel_id) on delete cascade,
	funnel_permission_body varchar(16)
);

create table colleague_permissions (
	colleague_permission_id uuid not null default uuid_generate_v4() primary key,
	client_p varchar(16) not null,
	room_p varchar(16) not null,
	group_p varchar(16) not null,
	colleague_p varchar(16) not null,
	course_p varchar(16) not null,
	archive_p varchar(16) not null,
	finance_p varchar(16) not null,
	company_colleague_id uuid references company_colleagues(company_colleague_id) on delete cascade
);