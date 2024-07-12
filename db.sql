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
