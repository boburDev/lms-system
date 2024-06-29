create table company_branch_activities (
	company_branch_activity_id uuid not null default uuid_generate_v4() primary key,
	company_branch_id uuid not null references company_branches(company_branch_id) on delete cascade,
	start_date timestamp not null,
	end_date timestamp not null,
	is_active boolean default true
);

create table company_branch_payment_history (
	payment_history_id uuid not null default uuid_generate_v4() primary key,
	company_branch_id uuid not null references company_branches(company_branch_id) on delete cascade,
	is_payment boolean default true,
	payment_ammount bigint not null,
	payment_app_type varchar(8) not null check(payment_app_type in ('payme', 'click')),
	create_at timestamp default current_timestamp
);

create table prices (
	price_id uuid not null default uuid_generate_v4() primary key,
	from_count int not null,
	to_count int not null,
	price int not null
);

create table sms_prices (
	sms_price_id uuid not null default uuid_generate_v4() primary key,
	from_count int not null,
	to_count int not null,
	price int not null
);

create table discounts (
    discount_id uuid not null default uuid_generate_v4() primary key,
    discount_term smallint not null,
    discount_percentage smallint not null
);

create table company_branch_discounts (
	company_branch_discount_id uuid not null default uuid_generate_v4() primary key,
	company_branch_id uuid not null references company_branches(company_branch_id) on delete cascade,
	discount_id uuid not null references discounts(discount_id),
	payment_id varchar(64),
	start_date date not null,
	end_date date not null,
	is_active boolean default true,
	reason smallint default 0
);

create table edu_colleague_salary_history (
	colleague_salary_history_id uuid not null default uuid_generate_v4() primary key,
	for_month timestamp not null,
	salary_amount numeric not null,
	edu_group_id uuid not null references edu_groups(edu_group_id),
	company_colleague_id uuid not null references company_colleagues(company_colleague_id) on delete cascade,
	company_branch_id uuid not null references company_branches(company_branch_id) on delete cascade,
	created_at timestamptz default current_timestamp
);

create table company_activities (
	company_activity_id uuid not null default uuid_generate_v4() primary key,
	company_activity_colleague_name varchar(64) not null,
	company_activity_object varchar(32) not null,
	company_activity_object_name varchar(64) not null,
	company_activity_event_name varchar(64) not null,
	company_activity_event_before text,
	company_activity_event_after text,
	created_at timestamptz default current_timestamp,
	company_branch_id uuid not null references company_branches(company_branch_id) on delete cascade
);

create table client_fields (
	client_field_id uuid not null default uuid_generate_v4() primary key,
	company_branch_id uuid references company_branches(company_branch_id) on delete cascade,
	field_name varchar(16) not null unique,
	field_type int not null references input_types(type_id),
	is_required boolean default false,
	company_type_index int references company_types(company_type_index),
	placeholder varchar(256)
);

create table client_field_values (
	cfv_id uuid not null default uuid_generate_v4() primary key,
	client_field_id uuid references client_fields(client_field_id) on delete cascade,
	company_client_id uuid references company_clients(company_client_id) on delete cascade,
	field_value text
);


create table company_leads (
	company_lead_id uuid not null default uuid_generate_v4() primary key,
	company_lead_name varchar(64) not null,
	company_lead_phone varchar(16),
	company_lead_status int default 1 not null,
	course_id uuid references edu_courses(edu_course_id) on delete cascade,
	funnel_id uuid references company_funnel_columns(company_funnel_column_id),
	for_added_client_colleague_id uuid references company_colleagues(company_colleague_id),
	company_branch_id uuid not null references company_branches(company_branch_id) on delete cascade,
	is_archive boolean default false,
	created_at timestamptz default current_timestamp
);

create table leads_fields (
	lead_field_id uuid not null default uuid_generate_v4() primary key,
	company_branch_id uuid references company_branches(company_branch_id) on delete cascade,
	field_name varchar(16) not null unique,
	field_type int not null references input_types(type_id),
	is_required boolean default false,
	company_type_index int references company_types(company_type_index),
	placeholder varchar(256)
);

create table leads_fields_value (
	lfv_id uuid not null default uuid_generate_v4() primary key,
	lead_field_id uuid references leads_fields(lead_field_id) on delete cascade,
	company_lead_id uuid references company_leads(company_lead_id) on delete cascade,
	field_value text
);

create table auto_payment_group (
	auto_payment_group_id uuid not null default uuid_generate_v4() primary key,
	group_id uuid not null,
	branch_id uuid not null,
	payment_status int default 1,
	payment_month timestamptz
);

create table company_colleague_salaries (
	company_colleague_salary_id uuid not null default uuid_generate_v4() primary key,
	company_colleague_salary_amount integer not null default 0,
	company_colleague_salary_type integer not null default 1,
	company_colleague_id uuid not null references company_colleagues(company_colleague_id) on delete cascade,
	company_branch_id uuid not null references company_branches(company_branch_id) on delete cascade
);

create table connect_time (
	connect_id uuid not null default uuid_generate_v4() primary key,
	company_colleague_id uuid not null references company_colleagues(company_colleague_id) on delete cascade,
	company_branch_id uuid not null references company_branches(company_branch_id) on delete cascade,
	connect_time bigint not null,
	disconnect_time bigint not null,
	created_at timestamp default current_timestamp
);

create table daily_time_branches(
	branch_id uuid not null references company_branches (company_branch_id) on delete cascade,
	online_time bigint not null,
	online_date timestamp default current_timestamp
);

create table daily_time_colleagues(
    colleague_id uuid not null references company_colleagues( company_colleague_id) on delete cascade,
    online_time smallint not null,
    created_at date not null
);

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

create table forgot_password (
	sended_code int,
	sender_id uuid not null references company_colleagues(company_colleague_id) on delete cascade,
	created_at timestamptz default CURRENT_TIMESTAMP + (2 * interval '1 minute')
);

create table phone (
    phone_id uuid not null default uuid_generate_v4() primary key,
    phone_number varchar(12) not null unique,
    temp_code varchar(6),
    created_at timestamp default current_timestamp
);

create table sms_service (
	sms_service_id uuid not null default uuid_generate_v4() primary key,
	sms_count integer default 0,
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

create table company_forms (
	company_form_id uuid not null default uuid_generate_v4() primary key,
	company_form_name varchar(32) not null,
	company_form_color varchar(16) not null,
	created_at timestamp default current_timestamp,
	company_funnel_id uuid references company_funnels(company_funnel_id) on delete cascade,
	company_branch_id uuid not null references company_branches(company_branch_id) on delete cascade
);

create table company_form_item_pics (
	company_form_item_pic_id uuid not null default uuid_generate_v4() primary key,
	company_form_item_pic_path varchar(128) not null,
	company_form_item_pic_width int not null,
	company_form_item_pic_heigth int not null,
	company_form_item_pic_position varchar(32) not null default 'left',
	company_form_item_pic_caption varchar(32)
);

create table company_form_items (
	company_form_item_id uuid not null default uuid_generate_v4() primary key,
	company_form_item_name varchar(32) not null,
	company_form_item_desc text,
	company_form_item_required boolean default false,
	company_form_item_type int not null,
	created_at timestamp default current_timestamp,
	company_form_item_pic_id uuid references company_form_item_pics(company_form_item_pic_id) on delete cascade,
	company_form_id uuid references company_forms(company_form_id) on delete cascade
);

create table company_form_item_options (
	company_form_item_option_id uuid not null default uuid_generate_v4() primary key,
	company_form_item_option_name varchar(32) not null,
	company_form_item_option_path varchar(128) not null,
	company_form_item_option_pic_width int not null,
	company_form_item_option_pic_heigth int not null,
	company_form_item_option_position varchar(32) not null default 'left',
	company_form_item_option_caption varchar(32)
);
