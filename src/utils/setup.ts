import AppDataSource from '../config/ormconfig';
import Countries from '../entities/country.entity';
import Regions, { Districts } from '../entities/regions.entity';
import Admin from '../entities/admin.entity';
import bcrypt from 'bcrypt';

async function setup() {
    try {
        console.log("Setting up the project...");

        // Initialize the database connection
        await AppDataSource.initialize();
        console.log("Database connected!");

        // Repositories
        const countryRepository = AppDataSource.getRepository(Countries);
        const regionRepository = AppDataSource.getRepository(Regions);
        const districtRepository = AppDataSource.getRepository(Districts);
        const adminRepository = AppDataSource.getRepository(Admin);

        // Check and create demo countries, regions, and districts
        const existingCountry = await countryRepository.findOneBy({ country_name: 'Uzbekistan' });
        if (!existingCountry) {
            console.log("Creating demo country, regions, and districts...");

            // Create Uzbekistan
            const country = new Countries();
            country.country_name = 'Uzbekistan';
            const savedCountry = await countryRepository.save(country);

            // Add regions and districts
            const regionsAndDistricts = [
                { region: 'Tashkent', districts: ['Yunusabad', 'Chilanzar', 'Olmazor'] },
                { region: 'Samarkand', districts: ['Payarik', 'Pastdargom'] },
                { region: 'Andijan', districts: ['Asaka', 'Baliqchi'] },
            ];

            for (const item of regionsAndDistricts) {
                const region = new Regions();
                region.region_name = item.region;
                region.country_id = savedCountry.country_id;
                const savedRegion = await regionRepository.save(region);

                for (const districtName of item.districts) {
                    const district = new Districts();
                    district.district_name = districtName;
                    district.region_id = savedRegion.region_id;
                    await districtRepository.save(district);
                }
            }

            console.log("Demo country, regions, and districts created successfully!");
        } else {
            console.log("Demo country, regions, and districts already exist. Skipping creation.");
        }

        // Check and create demo admin, director, and teacher
        const roles = [
            { role: 1, title: 'Director' },
            { role: 2, title: 'Admin' },
            { role: 3, title: 'Teacher' },
        ];

        for (const { role, title } of roles) {
            let demoExists = true;
            let counter = 1;
            let username = `demo${counter}`;

            while (demoExists) {
                const existingAdmin = await adminRepository.findOneBy({ admin_username: username });
                demoExists = !!existingAdmin; 
                if (demoExists) {
                    counter++;
                    username = `demo${counter}`;
                }
            }

            const password = `password${counter}`;
            const hashedPassword = await bcrypt.hash(password, 10);

            const newAdmin = new Admin();
            newAdmin.admin_username = username;
            newAdmin.admin_name = `${title} Demo`;
            newAdmin.admin_lastname = `${title} Lastname`;
            newAdmin.admin_phone = `+99890${counter.toString().padStart(7, '0')}`;
            newAdmin.admin_password = hashedPassword;
            newAdmin.admin_role = role;
            newAdmin.admin_status = 1;

            const savedAdmin = await adminRepository.save(newAdmin);

            console.log(`Created demo ${title}:`);
            console.log({
                username: savedAdmin.admin_username,
                password,
                phone: savedAdmin.admin_phone,
                role: title,
            });
        }

        console.log("Setup completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error during setup:", error);
        process.exit(1);
    }
}

setup();
