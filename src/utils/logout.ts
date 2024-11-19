import AppDataSource from "../config/ormconfig";
import TokenDetails from "../entities/token_details.entity";

export const logout = async (colleagueId: string) => {
  try {
    const tokenDetailsRepository = AppDataSource.getRepository(TokenDetails);

    // Delete the token details for the user
    await tokenDetailsRepository.delete({ colleagueId });
    return { message: "Tizimdan chiqildi." };
  } catch (error) {
    throw new Error("Tizimdan chiqishda xatolik yuz berdi.");
  }
};
