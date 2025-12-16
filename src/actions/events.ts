'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getActiveEvent() {
    try {
        const now = new Date();

        const event = await db.event.findFirst({
            where: {
                status: 'ACTIVE',
                startDate: { lte: now },
                endDate: { gte: now }
            }
        });

        return { success: true, event };
    } catch (error) {
        console.error("Error fetching active event:", error);
        return { success: false, event: null };
    }
}

export async function createEvent(data: {
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    multiplier: number;
    type?: string;
}) {
    try {
        const event = await db.event.create({
            data: {
                ...data,
                status: 'SCHEDULED'
            }
        });

        revalidatePath('/');
        revalidatePath('/admin');

        return { success: true, event };
    } catch (error) {
        console.error("Error creating event:", error);
        return { success: false, error: "Failed to create event" };
    }
}

export async function activateEvent(eventId: string) {
    try {
        const event = await db.event.update({
            where: { id: eventId },
            data: { status: 'ACTIVE' }
        });

        revalidatePath('/');
        return { success: true, event };
    } catch (error) {
        console.error("Error activating event:", error);
        return { success: false, error: "Failed to activate event" };
    }
}
