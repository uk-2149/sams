import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getUserFromRequest } from "../../../../lib/getUserFromRequest";
import { startOfDay, subDays, format } from "date-fns";

export async function GET() {
  try {
    const user = await getUserFromRequest();

    if (!user || user.role !== "UNIVERSITY_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the last 14 days
    const endDate = new Date();
    const startDate = subDays(startOfDay(endDate), 13);

    const [attendances, sessions] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          session: {
            class: { universityId: user.id },
            date: { gte: startDate, lte: endDate },
          },
        },
        select: {
          status: true,
          session: { select: { date: true } },
        },
      }),
      prisma.session.findMany({
        where: {
          class: { universityId: user.id },
          date: { gte: startDate, lte: endDate },
        },
        select: { date: true },
      }),
    ]);

    const chartDataMap = new Map<string, { date: string; present: number; absent: number; late: number; excused: number; total: number; sessions: number }>();

    for (let i = 0; i < 14; i++) {
      const date = subDays(startOfDay(endDate), 13 - i);
      const dateStr = format(date, "MMM dd");
      chartDataMap.set(dateStr, { date: dateStr, present: 0, absent: 0, late: 0, excused: 0, total: 0, sessions: 0 });
    }

    let overallPresent = 0;
    let overallAbsent = 0;
    let overallLate = 0;
    let overallExcused = 0;

    for (const record of attendances) {
      const dateStr = format(new Date(record.session.date), "MMM dd");
      const dayData = chartDataMap.get(dateStr);
      if (dayData) {
        dayData.total += 1;
        if (record.status === "PRESENT") dayData.present += 1;
        else if (record.status === "ABSENT") dayData.absent += 1;
        else if (record.status === "LATE") dayData.late += 1;
        else if (record.status === "EXCUSED") dayData.excused += 1;
      }
      
      // Breakdown only for today
      const todayStr = format(new Date(), "MMM dd");
      if (dateStr === todayStr) {
        if (record.status === "PRESENT") overallPresent++;
        else if (record.status === "ABSENT") overallAbsent++;
        else if (record.status === "LATE") overallLate++;
        else if (record.status === "EXCUSED") overallExcused++;
      }
    }

    for (const session of sessions) {
      const dateStr = format(new Date(session.date), "MMM dd");
      const dayData = chartDataMap.get(dateStr);
      if (dayData) {
        dayData.sessions += 1;
      }
    }

    const data = Array.from(chartDataMap.values()).map(d => ({
      ...d,
      attendancePercentage: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0
    }));

    const breakdown = [
      { name: "Present", value: overallPresent, fill: "#10b981" },
      { name: "Absent", value: overallAbsent, fill: "#ef4444" },
      { name: "Late", value: overallLate, fill: "#f59e0b" },
      { name: "Excused", value: overallExcused, fill: "#3b82f6" },
    ];

    return NextResponse.json({
      success: true,
      data: {
        daily: data,
        breakdown,
      },
    });
  } catch (err) {
    console.error("Admin chart error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
