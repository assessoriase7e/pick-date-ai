"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { ClientComboWithDetails } from "@/types/combo";

export async function getClientCombos(clientId: number): Promise<ClientComboWithDetails[]> {
  try {
    const user = await getClerkUser();

    if (!user) {
      return [];
    }

    const clientCombos = await prisma.clientCombo.findMany({
      where: {
        clientId: clientId,
        client: {
          userId: user.id,
        },
      },
      include: {
        combo: {
          include: {
            comboServices: {
              include: {
                service: {
                  include: {
                    serviceCollaborators: {
                      include: {
                        collaborator: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        sessions: {
          include: {
            service: {
              include: {
                serviceCollaborators: {
                  include: {
                    collaborator: true,
                  },
                },
              },
            },
          },
        },
        client: true,
      },
      orderBy: {
        purchaseDate: "desc",
      },
    });

    return clientCombos;
  } catch (error) {
    console.error("Erro ao buscar combos do cliente:", error);
    return [];
  }
}

export async function hasClientCombos(clientId: number): Promise<boolean> {
  try {
    const user = await getClerkUser();

    if (!user) {
      return false;
    }

    const count = await prisma.clientCombo.count({
      where: {
        clientId: clientId,
        client: {
          userId: user.id,
        },
      },
    });

    return count > 0;
  } catch (error) {
    console.error("Erro ao verificar combos do cliente:", error);
    return false;
  }
}