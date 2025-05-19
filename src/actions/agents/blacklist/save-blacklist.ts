"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { BlackListFormValues } from "@/validators/blacklist";

export async function saveBlackList(data: BlackListFormValues) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const filteredPhones = data.phones.filter(
      (phone) => phone.number.trim() !== ""
    );

    const existingBlackList = await prisma.blackList.findUnique({
      where: { userId },
      include: { phones: true }
    });

    if (existingBlackList) {
      // Atualiza a blacklist existente
      await prisma.$transaction(async (tx) => {
        // Remove todos os telefones existentes
        await tx.blackListPhone.deleteMany({
          where: { blackListId: existingBlackList.id }
        });

        // Cria os novos registros de telefone
        await Promise.all(
          filteredPhones.map(phone =>
            tx.blackListPhone.create({
              data: {
                number: phone.number,
                name: phone.name,
                blackListId: existingBlackList.id
              }
            })
          )
        );
      });

      revalidatePath("/agents");
      return {
        success: true,
        data: existingBlackList
      };
    } else {
      // Cria uma nova blacklist com os telefones
      const newBlackList = await prisma.blackList.create({
        data: {
          userId,
          phones: {
            create: filteredPhones.map(phone => ({
              number: phone.number,
              name: phone.name
            }))
          }
        },
        include: { phones: true }
      });

      revalidatePath("/agents");
      return {
        success: true,
        data: newBlackList
      };
    }
  } catch (error) {
    console.error("Erro ao salvar lista negra:", error);
    return {
      success: false,
      error: "Falha ao salvar lista negra"
    };
  }
}
