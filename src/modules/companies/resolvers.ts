import AppDataSource from '../../config/ormconfig';
import { Companies, CompanyBranches } from "../../entities/company/company.entity";
import EmployersEntity from '../../entities/employer/employers.entity';
import { AddCompanyBranchInput, BranchInfo, CompanyBranch, SearchCompanyInput, UpdateCompanyBranchInput } from '../../types/company';
import BranchActivityEntity from '../../entities/company/company_activity.entity';
import positionIndicator from '../../utils/status_and_positions';
import { sign } from '../../utils/jwt';
import { getChanges } from '../../utils/eventRecorder';

const resolvers = {
	Query: {
		companies: async (_parametr: unknown, { input }: { input: SearchCompanyInput }, context: any) => {
			if (!context || (context && !context.isAdmin)) throw new Error("Not exist access token!");
			const catchErrors = context.catchErrors;
			const branchId = context.branchId;
			try {
				let newInput: any = {
					countryId: input.countryId,
					regionId: input.regionId,
					districtId: input.districtId
				}
				let lastValue = {};

				for (const key in newInput) {
					if (newInput[key]) {
						lastValue = { [key]: newInput[key] };
					}
				}

				const branchesRepository = AppDataSource.getRepository(CompanyBranches);
				const queryBuilder = branchesRepository.createQueryBuilder('branch')
					.leftJoinAndSelect('branch.companies', 'company')
					.leftJoinAndSelect('branch.districts', 'district')
					.leftJoinAndSelect('district.regions', 'region')
					.leftJoinAndSelect('region.countries', 'country');

				if (newInput && newInput.countryId) {
					queryBuilder.andWhere('country.country_id = :countryId', { countryId: newInput.countryId });
				}

				if (newInput && newInput.regionId) {
					queryBuilder.andWhere('region.region_id = :regionId', { regionId: newInput.regionId });
				}

				if (newInput && newInput.districtId) {
					queryBuilder.andWhere('district.district_id = :districtId', { districtId: newInput.districtId });
				}
				const branches = await queryBuilder.getMany();

				const result = branches.reduce((acc: { company_id: string, company_name: string, companyBranches: CompanyBranches[] }[], branch: CompanyBranches) => {
					const company = acc.find(c => c.company_id === branch.companies.company_id);
					if (company) {
						company.companyBranches.push(branch);
					} else {
						acc.push({
							company_id: branch.companies.company_id,
							company_name: branch.companies.company_name,
							companyBranches: [branch],
						});
					}
					return acc;
				}, []);
				return result;
			} catch (error) {
				await catchErrors(error, 'companies', branchId);
				throw error;
			}
		},
	},
	Mutation: {
		addCompanyBranch: async (_parent: unknown, { input }: { input: AddCompanyBranchInput }, context: any) => {
			if (!context?.branchId) throw new Error("Not exist access token!");
			const catchErrors = context.catchErrors;
			const branchId = context.branchId;
			const writeActions = context.writeActions;
		
			try {
				const activityRepository = AppDataSource.getRepository(BranchActivityEntity);
				const branchRepository = AppDataSource.getRepository(CompanyBranches);
				const employerRepository = AppDataSource.getRepository(EmployersEntity);
		
				// Validate uniqueness of phone numbers
				let employerData = await employerRepository.findOneBy({ employer_phone: input.derectorPhone, employer_position: 1 });
				if (employerData) throw new Error(`Bu "${input.derectorPhone}" nomerdan foydalana olmaysiz band qilingan`);
		
				let branchData = await branchRepository.findOneBy({ company_branch_phone: input.branchPhone });
				if (branchData) throw new Error(`"${input.branchName}" nomidan foydalana olmaysiz band qilingan`);
		
				// Create and populate new branch entity
				let companyBranches = await branchRepository.findBy({ branch_company_id: input.companyId });
				let subdomenIndex = String(companyBranches.length).padStart(4, '0');
				let branch = new CompanyBranches();
				branch.company_branch_name = input.branchName;
				branch.company_branch_phone = input.branchPhone;
				branch.company_branch_subdomen = `${subdomenIndex}-${input.branchName.replace(/([1234567890]|[\s]|[~`!@#$%^&*()_+{}:";'])/g, "").toLowerCase()}`;
				branch.branch_district_id = input.districtId;
				branch.branch_company_id = input.companyId;
		
				// Save the new branch
				let newBranch = await branchRepository.save(branch);
		
				// Log each change in the newly created branch entity
				const branchChanges = getChanges({}, newBranch, [
					"company_branch_name",
					"company_branch_phone",
					"company_branch_subdomen",
					"branch_district_id",
					"branch_company_id"
				]);
		
				for (const change of branchChanges) {
					await writeActions({
						objectId: newBranch.company_branch_id,
						eventType: 1,
						eventBefore: change.before,
						eventAfter: change.after,
						eventObject: "CompanyBranch",
						eventObjectName: change.field,
						employerId: context.colleagueId || "",
						employerName: context.colleagueName || "",
						branchId: context.branchId || "",
					});
				}
		
				// Create branch activity
				let daysToAdd = 7;
				const startDate = new Date();
				const endDate = new Date(startDate);
				endDate.setDate(endDate.getDate() + daysToAdd);
		
				let activity = new BranchActivityEntity();
				activity.group_start_date = startDate;
				activity.group_end_date = endDate;
				activity.branch_id = newBranch.company_branch_id;
				let newActivity = await activityRepository.save(activity);
		
				// Log branch activity creation
				await writeActions({
					objectId: newActivity.branch_activity_id,
					eventType: 1,
					eventBefore: "", // No "before" state for creation
					eventAfter: JSON.stringify(newActivity),
					eventObject: "BranchActivity",
					eventObjectName: "group_start_date to group_end_date",
					employerId: context.colleagueId,
					employerName: context.colleagueName,
					branchId: context.branchId
				});
		
				// Create a new employer for the branch
				let employer = new EmployersEntity();
				employer.employer_name = input.derectorName;
				employer.employer_phone = input.derectorPhone;
				employer.employer_position = 1;
				employer.employer_branch_id = newBranch.company_branch_id;
				employer.employer_password = input.password;
				let newEmployer = await employerRepository.save(employer);
		
				// Log employer creation
				const employerChanges = getChanges({}, newEmployer, [
					"employer_name",
					"employer_phone",
					"employer_position",
					"employer_branch_id"
				]);
		
				for (const change of employerChanges) {
					await writeActions({
						objectId: newEmployer.employer_id,
						eventType: 1,
						eventBefore: change.before,
						eventAfter: change.after,
						eventObject: "Employer",
						eventObjectName: change.field,
						employerId: context.colleagueId || "",
						employerName: context.colleagueName || "",
						branchId: context.branchId || "",
					});
				}
		
				// Return the payload with token and redirect link
				let payload = {
					branchId: newEmployer.employer_branch_id,
					colleagueId: newEmployer.employer_id,
					role: positionIndicator(newEmployer.employer_position)
				};
				
				return {
					token: sign(payload),
					redirect_link: `http://${newBranch?.company_branch_subdomen}.localhost:3000/`,
					role: positionIndicator(newEmployer.employer_position)
				};
			} catch (error) {
				await catchErrors(error, 'addCompanyBranch', branchId, input);
				throw error;
			}
		},
		updateCompanyBranch: async (_parent: unknown, { input }: { input: UpdateCompanyBranchInput }, context: any) => {
			if (!context?.branchId) throw new Error("Not exist access token!");
			const catchErrors = context.catchErrors;
			const branchId = context.branchId;
			const writeActions = context.writeActions;
		
			try {
				const branchRepository = AppDataSource.getRepository(CompanyBranches);
		
				// Fetch original branch data
				let branch = await branchRepository.findOneBy({ company_branch_id: input.branchId });
				if (!branch) throw new Error("Branch not found");
		
				const originalBranch = { ...branch };
		
				// Update branch data
				branch.company_branch_name = input.branchName || branch.company_branch_name;
				branch.company_branch_phone = input.branchPhone || branch.company_branch_phone;
				branch.branch_district_id = input.districtId || branch.branch_district_id;
		
				// Save changes
				let updatedBranch = await branchRepository.save(branch);
		
				// Log changes
				const branchChanges = getChanges(originalBranch, updatedBranch, [
					"company_branch_name",
					"company_branch_phone",
					"branch_district_id"
				]);
		
				for (const change of branchChanges) {
					await writeActions({
						objectId: branch.company_branch_id,
						eventType: 2,
						eventBefore: change.before,
						eventAfter: change.after,
						eventObject: "CompanyBranch",
						eventObjectName: change.field,
						employerId: context.colleagueId || "",
						employerName: context.colleagueName || "",
						branchId: context.branchId || ""
					});
				}
		
				return updatedBranch;
			} catch (error) {
				await catchErrors(error, 'updateCompanyBranch', branchId, input);
				throw error;
			}
		}
	},
	BranchInfo: {
		branchId: (global: BranchInfo) => global?.company_branch_id,
		branchName: (global: BranchInfo) => global?.company_branch_name,
		branchPhone: (global: BranchInfo) => global?.company_branch_phone,
		branchStatus: (global: BranchInfo) => global?.company_branch_status,
		branchBalance: (global: BranchInfo) => global?.company_branch_balance,
		branchSubdomen: (global: BranchInfo) => global?.company_branch_subdomen,
	},
	Company: {
		companyId: (global: CompanyBranch) => global.company_id,
		companyName: (global: CompanyBranch) => global.company_name,
		branches: (global: CompanyBranch) => {
			if (global && !Array.isArray(global.companyBranches)) return [];
			return global && global.companyBranches && global.companyBranches.map(i => {
				return {
					branchId: i.company_branch_id,
					branchName: i.company_branch_name,
					branchPhone: i.company_branch_phone,
					branchStatus: i.company_branch_status,
					branchBalance: i.company_branch_balance,
					branchSubdomen: i.company_branch_subdomen,
					companyId: i.companies.company_id,
					companyName: i.companies.company_name,
					regionId: i.districts.regions.region_id,
					regionName: i.districts.regions.region_name,
					districtId: i.districts.district_id,
					districtName: i.districts.district_name,
					countryId: i.districts.regions.countries.country_id,
					countryName: i.districts.regions.countries.country_name
				};
			});
		}
	}
};

export default resolvers;
