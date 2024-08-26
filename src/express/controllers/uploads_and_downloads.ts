import { Request, Response } from 'express'
import AppDataSource from "../../config/ormconfig";
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import EmployersEntity from '../../entities/employer/employers.entity';
import FunnelColumnsEntity from "../../entities/funnel/columns.entity";
import LeadsEntity from "../../entities/funnel/leads.entity";
// import Groups from "../../entities/group/groups.entity";
import StudentEntity from "../../entities/student/students.entity";
import { formatDate } from '../../utils/date';

export const uploadExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            throw new Error('File is failed')
        }
        if (!req.user || typeof req.user == 'string') throw new Error("User not found!");
        const type = String(req.headers.type)
        
        if (!['student', 'colleague', 'lead'].includes(type)) throw new Error("Invalid type specified!");

        const funnelId = req.headers.funnelid
        const colleagueId = req.user.colleagueId
        const branchId = req.user.branchId
        const role = req.user.role

        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const errors = [];
        const data:any = [];
        let infoData: any[] = []
        let employerRepository
        let leadRepository
        let studentRepository
        // let groupRepository
        let newOrder = 0
        if (type === "student") {
            studentRepository = AppDataSource.getRepository(StudentEntity)

            // groupRepository = AppDataSource.getRepository(Groups)
            // infoData = await groupRepository.createQueryBuilder("group")
            //     .leftJoinAndSelect("group.employer", "employer")
            //     .where("group.group_branch_id = :branchId", { branchId: branchId })
            //     .andWhere("group.group_deleted IS NULL")
            //     .getMany();
        } else if (type === "colleague") {
            employerRepository = AppDataSource.getRepository(EmployersEntity)
            infoData = await employerRepository.find({
                where: { employer_branch_id: branchId }
            })
        } else if (type === "lead") {
            const funnelColumnRepository = AppDataSource.getRepository(FunnelColumnsEntity)
            infoData = await funnelColumnRepository.createQueryBuilder("funnelColumn")
                .where("funnelColumn.funnel_id = :funnelId", { funnelId })
                .andWhere("funnelColumn.funnel_column_deleted IS NULL")
                .andWhere("funnelColumn.funnel_column_order = 1")
                .getMany();
            if (!infoData.length) {
                return res.status(400).json({ data: null, error: 'Funnel or Funnelcolumn not found' })
            }
            leadRepository = AppDataSource.getRepository(LeadsEntity)
            let dataLeadOrders = await leadRepository.createQueryBuilder("leads")
                .where("leads.lead_funnel_column_id = :columnId", { columnId: infoData[0].funnel_column_id })
                .andWhere("leads.lead_deleted IS NULL")
                .orderBy("leads.lead_created", "DESC")
                .getMany()

            newOrder = dataLeadOrders[0] && dataLeadOrders[0]?.lead_order || 1
        }
        let begin = true

        const validatePhone = (phone: string | number) => {
            if (typeof phone === "number") {
                phone = phone.toString().padStart(12, '998');
            } else {
                const numericPhone = phone.replace(/[^0-9]/g, '');
                phone = numericPhone.length === 9 ? '998' + numericPhone : numericPhone;
            }
            return phone.length === 12 ? phone : null;
        };

        for (let cell in worksheet) {
            const row = parseInt(cell.substring(1)) > 2;
            if (cell.startsWith('B') && row) {
                const name = worksheet[cell]?.v || '';
                const phone = worksheet[`C${cell.substring(1)}`]?.v || '';
                const isNameValid = !/\d/.test(name) && name.length > 4;
                const isPhoneValid = validatePhone(phone);
                if (!(isNameValid && isPhoneValid) && ['student', 'colleague'].includes(type)) {
                    errors.push({ name: name || null, phone: phone || null })
                } else {
                    if (type === "student" && studentRepository) {
                        let student = new StudentEntity()
                        student.student_name = name
                        student.student_phone = String(isPhoneValid)
                        student.student_status = 1
                        // student.student_gender = input.studentGender
                        student.colleague_id = colleagueId
                        student.student_branch_id = branchId
                        let resData: any = await studentRepository.save(student)
                        let userData = {
                            studentId: resData.student_id,
                            studentName: name,
                            studentPhone: isPhoneValid,
                            studentStatus: resData.student_status,
                        }
                        data.push(userData)
                    } else if (type === "colleague" && employerRepository) {
                        let exist = infoData.filter(employer => employer.employer_phone == isPhoneValid)
                        if (exist.length && begin) {
                            begin = false
                            errors.push({ name: name || null, phone: phone || null })
                        } else {
                            let employer = new EmployersEntity()
                            employer.employer_name = name.trim()
                            employer.employer_phone = isPhoneValid || ''
                            employer.employer_branch_id = branchId
                            let newEmployer = await employerRepository.save(employer)
                            let userData = {
                                employerId: newEmployer.employer_id,
                                employerName: name,
                                employerPhone: isPhoneValid,
                                employerBranchId: branchId
                            }
                            infoData.push(newEmployer)
                            data.push(userData)
                        }
                    } else if (type === "lead" && leadRepository) {
                        const column = infoData[0]
                        let lead = new LeadsEntity()
                        lead.lead_order = newOrder
                        lead.lead_name = name
                        lead.lead_phone = isPhoneValid || ''
                        lead.lead_funnel_id = column.funnel_id
                        lead.lead_funnel_column_id = column.funnel_column_id
                        lead.lead_employer_id = colleagueId
                        lead.lead_branch_id = branchId
                        let resData: any = await leadRepository.save(lead)
                        let userData = {
                            leadId: resData.lead_id,
                            leadName: name,
                            leadPhone: isPhoneValid,
                            leadOrder: newOrder,
                            columnId: column.funnel_column_id
                        }
                        data.push(userData)
                        newOrder++
                    }
                }
            }
        }
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return res.status(500).send('Error processing file.');
            }
            return;
        });
        res.json({ data: { data, errors }, error: null })
    } catch (error) {
        res.status(400).json({ data: null, error: (error as Error).message })
    }
}

export const downloadExcel = async (req: Request, res: Response) => {
    try {
        // if (!req.user || typeof req.user == 'string') throw new Error("User not found!");
        // const type = String(req.headers.type)
        // if (!['student', 'colleague', 'lead'].includes(type)) throw new Error("Invalid type specified");
        // const colleagueId = req.user.colleagueId
        // const branchId = req.user.branchId
        // const role = req.user.role

        const data = [
            { name: "John Doe", phone: "123-456-7890", group_name: "Group A" },
            { name: "Jane Smith", phone: "987-654-3210", group_name: "Group B" },
            { name: "Alice Johnson", phone: "555-555-5555", group_name: "Group C" }
        ];

        const headers: string[][] = [
            ["O'quvchilar", "", ""],
            ["№", "F.I.O", "phone"]
        ];

        const dataWithIndex: (string | number)[][] = data.map((item, index) => [
            index + 1,
            item.name,
            item.phone,
            item.group_name
        ]);

        const finalData: (string | number)[][] = [...headers, ...dataWithIndex];
        const worksheet = xlsx.utils.aoa_to_sheet(finalData);
        worksheet['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }  // Merge cells A1, B1, C1
        ];

        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');
        const fileName = `${formatDate(new Date())}-students.xlsx`
        const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ data: null, error: (error as Error).message })
    }
}

export const uploadPhotos = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            throw new Error('File is failed')
        }

        const filePath = req.file.path;
        let file = req.file
        const newPath = file.destination.split('./public')[1] + '/' + file.filename
        res.json({ data: newPath, error: false, message: null })
    } catch (error) {
        console.log(error);
    }
}


export const downloadPhotos = async (req: Request, res: Response) => {
    try {
        const pathFile = String(req.headers.path)
        const imagePath = path.join(__dirname, '../../../public', pathFile);
        fs.readFile(imagePath, (err, data) => {
            if (err) {
                return res.status(500).send('Error reading the image path.');
            }
            res.setHeader('Content-Type', 'image/jpeg');
            res.send(data);
        });
    } catch (error) {
        res.status(500).json({ data: null, error: (error as Error).message })
    }
}


