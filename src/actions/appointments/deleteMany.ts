"use server";

import { prisma } from "@/lib/db";
import moment from "moment";
import { revalidatePath } from "next/cache";

type DeleteManyProps = {
    selectedCalendar: any;
};

export const deleteManyAppointments = async ({
    selectedCalendar,
}: DeleteManyProps) => {
    try {
        await prisma.appointment.deleteMany({
            where: {
                calendarId: selectedCalendar.id,
                startTime: {
                    gt: moment().toDate(),
                },
                status: "scheduled",
            },
        });

        revalidatePath("/calendar");
        revalidatePath("/reports");
        revalidatePath("appointments");
    } catch (error) {
        console.error("Erro ao deletar muitos agendamentos ", error);
        return false;
    }
};
