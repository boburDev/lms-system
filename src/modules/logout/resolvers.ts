import { logout } from "../../utils/logout";

const resolvers = {
  Mutation: {
    logout: async (_parent: unknown, { colleagueId }: { colleagueId: string }) => {
      return await logout(colleagueId);
    },
    // other mutations...
  },
};

export default resolvers;
