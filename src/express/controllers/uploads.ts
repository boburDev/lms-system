import { Request, Response } from 'express'
import AppDataSource from "../../config/ormconfig";

import xlsx from 'xlsx';
import EmployersEntity from '../../entities/employer/employers.entity';
import FunnelColumnsEntity from "../../entities/funnel/columns.entity";

export const uploadExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            throw new Error('File is failed')
        }
        if (!req.user || typeof req.user == 'string') throw new Error("User not found!");
        const type = String(req.headers.type)
        if (!['student', 'colleague', 'lead'].includes(type)) throw new Error("Invalid type specified");

        const funnelId = req.headers.funnelid
        const colleagueId = req.user.colleagueId
        const branchId = req.user.branchId
        const role = req.user.role
        
        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const errors = [];
        const data = [];
        let infoData: any[] = []
        let employerRepository
        if (type === "student") {

        } else if (type === "colleague") {
            employerRepository = AppDataSource.getRepository(EmployersEntity)
            infoData = await employerRepository.find({
                where: { employer_branch_id: branchId }
            })
        } else if (type === "lead") {
            const funnelColumnRepository = AppDataSource.getRepository(FunnelColumnsEntity)
            infoData = await funnelColumnRepository.createQueryBuilder("funnelColumn")
                // .leftJoinAndSelect("funnelColumn.funnels", "funnels")
                .where("funnelColumn.funnel_id = :funnelId", { funnelId })
                .andWhere("funnelColumn.funnel_column_deleted IS NULL")
                .andWhere("funnelColumn.funnel_column_order = 1")
                // .orderBy("funnelColumn.funnel_column_created", "DESC")
                .getMany();
        }
        let begin = true
        console.log(infoData);
        for (let cell in worksheet) {
            const row = parseInt(cell.substring(1)) > 2;
            if (cell.startsWith('B') && row) {
                const name = worksheet[cell]?.v || '';
                const phone = worksheet[`C${cell.substring(1)}`]?.v || '';

                const isNameValid = !/\d/.test(name) && name.length > 4;
                const isPhoneValid = validatePhone(phone);

                if (!(isNameValid && isPhoneValid)) {
                    errors.push({ name: name || null, phone: phone || null })
                } else {
                    if (type === "student") {

                    } else if (type === "colleague") {
                        let exist = infoData.filter(employer => employer.employer_phone == isPhoneValid)
                        if (exist.length && begin) {
                            begin = false
                            errors.push({ name: name || null, phone: phone || null })
                        } else if (employerRepository) {
                            let employer = new EmployersEntity()
                            employer.employer_name = name.trim()
                            employer.employer_phone = isPhoneValid
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
                    } else if (type === "lead") {
                        
                    }
                }
            }
        }
        console.log(1, data);   
        console.log(errors);

        res.send('ok')
    } catch (error) {
        console.log(error);
    }
}

const validatePhone = (phone: string | number) => {
    if (typeof phone === "number") {
        phone = phone.toString().padStart(12, '998');
    } else {
        const numericPhone = phone.replace(/[^0-9]/g, '');
        phone = numericPhone.length === 9 ? '998' + numericPhone : numericPhone;
    }
    return phone.length === 12 ? phone : null;
};

