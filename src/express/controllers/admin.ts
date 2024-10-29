import { Request, Response } from 'express'
import AppDataSource from '../../config/ormconfig'
import AdminEntity from '../../entities/admin.entity'
import { validateObjectCreateAdmin } from '../../utils/validation'
import { sign } from '../../utils/jwt'
import CountryEntity from '../../entities/country.entity'
import RegionEntity, { Districts } from '../../entities/regions.entity'
import { comparePassword } from '../../utils/bcrypt'

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body
        const adminRepository = AppDataSource.getRepository(AdminEntity)
        const adminData = await adminRepository.findOneBy({ admin_username: username, admin_status: 1 })
        if (!adminData) throw new Error("User not found");

        if (await comparePassword(password, adminData.admin_password)) {
            let payload = {
                branchId: null,
                colleagueId: null,
                role: null,
                adminId: adminData.admin_id
            }
            res.json({
                data: {
                    token: sign(payload),
                }, error: null
            })
        } else {
            res.status(400).json({ data: null, error: 'Password does not match' })
        }
    } catch (error) {
        res.status(400).json({ data: null, error: (error as Error).message })
    }
}

export const create = async (req: Request, res: Response) => {
    try {
        const { error, value } = validateObjectCreateAdmin(req.body)
        if (error?.message) throw new Error(error.message)
        const adminRepository = AppDataSource.getRepository(AdminEntity)

        const adminData = await adminRepository.createQueryBuilder("admin")
            .where("admin.admin_role = :role", { role: value.role })
            .orWhere("admin.admin_username = :username", { username: value.username })
            .orWhere("admin.admin_phone = :phone", { phone: value.phone })
            .getOne();

        if (adminData) {
            if (adminData.admin_username == value.username) {
                throw new Error(`Bu usernamedan foydalana olmaysiz band qilingan`)
            } else if (adminData.admin_phone == value.phone) {
                throw new Error(`Bu raqamdan foydalana olmaysiz band qilingan`)
            } else if (adminData.admin_role == value.role) {
                throw new Error(`Bu lavozimdan foydalana olmaysiz band qilingan`)
            }
        }
        let admin = new AdminEntity()
        admin.admin_username = value.username
        admin.admin_name = value.name
        admin.admin_lastname = value.lastname
        admin.admin_phone = value.phone
        admin.admin_role = value.role
        admin.admin_password = value.password
        let adminInfo = await adminRepository.save(admin)
        
        if (adminInfo.admin_role == 1) {
            const countryRepository = AppDataSource.getRepository(CountryEntity)

            const countryData = await countryRepository.createQueryBuilder("country")
                .where("country.country_name = 'Uzbekistan'")
                .getOne();

            if (!countryData) {
                let countryName = 'Uzbekistan'
                let regionName = 'Tashkent'
                let districtName = 'Olmazor'
                let country = new CountryEntity()
                country.country_name = countryName
                let countryData = await countryRepository.save(country)

                const regionRepository = AppDataSource.getRepository(RegionEntity)
                let region = new RegionEntity()
                region.region_name = regionName
                region.country_id = countryData.country_id
                let regionInfo = await regionRepository.save(region)

                const districtRepository = AppDataSource.getRepository(Districts)
                let district = new Districts()
                district.district_name = districtName
                district.region_id = regionInfo.region_id
                let districtInfo = await districtRepository.save(district)
            }
        }
        
        let payload = {
            branchId: null,
            colleagueId: null,
            role: null,
            adminId: adminInfo.admin_id
        }

        res.json({
            data: {
                token: sign(payload),
            }, error: null
        })
    } catch (error) {
        res.status(400).json({ data: null, error: (error as Error).message })
    }
}
