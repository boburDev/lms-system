import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Forms {
    @PrimaryGeneratedColumn('uuid')
    form_id: string

    @Column({ type: 'varchar', length: 30 })
    form_name: string

    @Column({ type: 'varchar', length: 30 })
    form_title: string

    @Column()
    form_description: string

    @Column({ type: 'int' })
    to_count: number
}
// create table company_forms(
//     company_form_id uuid not null default uuid_generate_v4() primary key,
//     company_form_name varchar(32) not null,
//     company_form_color varchar(16) not null,
//     created_at timestamp default current_timestamp,
//     company_funnel_id uuid references company_funnels(company_funnel_id) on delete cascade,
//     company_branch_id uuid not null references company_branches(company_branch_id) on delete cascade
// );

// create table company_form_item_pics(
//     company_form_item_pic_id uuid not null default uuid_generate_v4() primary key,
//     company_form_item_pic_path varchar(128) not null,
//     company_form_item_pic_width int not null,
//     company_form_item_pic_heigth int not null,
//     company_form_item_pic_position varchar(32) not null default 'left',
//     company_form_item_pic_caption varchar(32)
// );

// create table company_form_items(
//     company_form_item_id uuid not null default uuid_generate_v4() primary key,
//     company_form_item_name varchar(32) not null,
//     company_form_item_desc text,
//     company_form_item_required boolean default false,
//     company_form_item_type int not null,
//     created_at timestamp default current_timestamp,
//     company_form_item_pic_id uuid references company_form_item_pics(company_form_item_pic_id) on delete cascade,
//     company_form_id uuid references company_forms(company_form_id) on delete cascade
// );

// create table company_form_item_options(
//     company_form_item_option_id uuid not null default uuid_generate_v4() primary key,
//     company_form_item_option_name varchar(32) not null,
//     company_form_item_option_path varchar(128) not null,
//     company_form_item_option_pic_width int not null,
//     company_form_item_option_pic_heigth int not null,
//     company_form_item_option_position varchar(32) not null default 'left',
//     company_form_item_option_caption varchar(32)
// );
