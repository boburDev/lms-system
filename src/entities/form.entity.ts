import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CompanyBranches } from "./company/company.entity";
import Funnels from "./funnel/funnels.entity";

@Entity()
export default class Forms {
    @PrimaryGeneratedColumn('uuid')
    form_id: string

    @Column({ type: 'varchar', length: 30 })
    form_name: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    form_created: Date

    @Column({ type: 'timestamp', nullable: true })
    form_deleted: Date

    @Column()
    form_branch_id: string

    @ManyToOne(() => CompanyBranches, branch => branch.forms)
    @JoinColumn({ name: 'form_branch_id' })
    branches: CompanyBranches

    @OneToMany(() => FormConfigs, form_configs => form_configs.forms)
    form_configs: FormConfigs[]
    
    @OneToMany(() => FormItems, form_items => form_items.forms)
    form_items: FormItems[]
    
    @OneToMany(() => FormFunnels, form_funnel => form_funnel.forms)
    form_funnels: FormFunnels[]
}

@Entity()
export class FormConfigs {
    @PrimaryGeneratedColumn('uuid')
    form_config_id: string

    @Column({ type: 'varchar', length: 32, default: 'Roboto' })
    form_title_font: string
    
    @Column({ type: 'varchar', length: 2, default: '23' })
    form_title_font_size: string
    
    @Column({ type: 'varchar', length: 32, default: 'Roboto' })
    form_question_font: string
    
    @Column({ type: 'varchar', length: 2, default: '15' })
    form_question_font_size: string
    
    @Column({ type: 'varchar', length: 32, default: 'Roboto' })
    form_text_font: string
    
    @Column({ type: 'varchar', length: 2, default: '11' })
    form_text_font_size: string
    
    @Column({ type: 'varchar', length: 16, default: '0F55AF' })
    form_color: string
    
    @Column({ type: 'varchar', length: 16, default: 'F6F8FA' })
    form_background: string
    
    @Column({ type: 'varchar', length: 128, nullable: true })
    form_img_path: string
    
    @Column()
    form_id: string

    @ManyToOne(() => Forms, form => form.form_configs)
    @JoinColumn({ name: 'form_id' })
    forms: Forms
}

@Entity()
export class FormItems {
    @PrimaryGeneratedColumn('uuid')
    form_item_id: string

    @Column({ type: 'varchar', length: 30 })
    form_item_title: string

    @Column({ type: 'varchar', length: 256, nullable: true })
    form_item_description: string
    
    @Column({ type: 'boolean', default: false })
    form_item_required: boolean
    
    @Column({ type: 'int', default: 0})
    form_item_order: number;

    @Column({ type: 'varchar', length: 8 })
    form_item_type: string
    
    @Column({ type: 'varchar', length: 256, nullable: true })
    form_item_type_value: string

    @Column()
    form_id: string

    @ManyToOne(() => Forms, form => form.form_items)
    @JoinColumn({ name: 'form_id' })
    forms: Forms

    @OneToMany(() => Form_Item_Options, form_items => form_items.form_items)
    form_item_optins: Form_Item_Options[]
}

@Entity()
export class Form_Item_Options {
    @PrimaryGeneratedColumn('uuid')
    form_item_option_id: string

    @Column({ type: 'varchar', length: 30 })
    form_item_option_value: string

    @Column()
    form_item_id: string

    @ManyToOne(() => FormItems, form => form.form_item_optins)
    @JoinColumn({ name: 'form_item_id' })
    form_items: FormItems
}

@Entity()
export class FormFunnels {
    @PrimaryGeneratedColumn('uuid')
    form_funnel_id: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    form_funnel_created: Date
    
    @Column({ type: 'timestamp', nullable: true })
    form_funnel_deleted: Date
    
    @Column()
    funnel_id: string

    @Column()
    form_id: string

    @ManyToOne(() => Forms, form => form.form_configs)
    @JoinColumn({ name: 'form_id' })
    forms: Forms
    
    @ManyToOne(() => Funnels, funnel => funnel.form_funnels)
    @JoinColumn({ name: 'funnel_id' })
    funnels: Funnels
}