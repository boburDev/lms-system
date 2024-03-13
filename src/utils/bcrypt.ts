import bcrypt from 'bcrypt';

export const comparePassword = async(password: string, dbPassword: string): Promise<boolean> => {
    try {
        return await bcrypt.compare(password, dbPassword);
    } catch (error) {
        // Handle error appropriately
        console.error('Error comparing passwords:', error);
        return false; // Return false indicating comparison failure
    }        
}