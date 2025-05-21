import { prisma } from "@/lib/db";

export const checkBlocked = async (instance: string, number: string) => {
  return await prisma.blackListPhone.findFirst({
    where: {
      AND: [
        {
          blackList: {
            user: {
              evolutionInstances: {
                some: {
                  name: instance,
                },
              },
            },
          },
        },
        {
          number,
        },
      ],
    },
  });
};
