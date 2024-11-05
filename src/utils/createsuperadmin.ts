// import readline from 'readline';
import AppDataSource from "../config/ormconfig";
import AdminEntity from "../entities/admin.entity";
import bcrypt from 'bcrypt';

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });


const getUserInputStep1 = async () => {
    try {
        const adminRepository = AppDataSource.getRepository(AdminEntity);
        const find = await adminRepository.findOneBy({ admin_role: 1 });

        if (!find) {
            await getUserInputStep2();
        } else {
            console.log('SuperAdmin mavjud...');
            // rl.close();
            process.exit();
        }
    } catch (error) {
        console.error('Error fetching admin:', error);
        process.exit(1);
    }
}

const getUserInputStep2 = async () => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("p@ssw0rd", salt);

        const adminRepository = AppDataSource.getRepository(AdminEntity);
        const newAdmin = adminRepository.create({
            admin_name: "Админ",
            admin_lastname: "Админ",
            admin_username: 'admin',
            admin_password: hashedPassword,
            admin_role: 1, // Assuming role 1 is for 'admin'
            admin_status: 1 // Assuming 1 is an active status
        });

        await adminRepository.save(newAdmin);
        console.log('Create Super User...');
    } catch (error) {
        console.error('Error creating Super User:', error);
    } finally {
        // rl.close();
        process.exit();
    }
};

(async () => {
    await getUserInputStep1();
})();