"use server";

import { prisma } from "@/lib/db";
import moment from "moment";

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
  } catch (error) {
    console.error("Erro ao deletar muitos agendamentos ", error);
    return false;
  }
};
