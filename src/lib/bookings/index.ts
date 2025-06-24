/**
 * Bookings API Functions
 *
 * Query device bookings and scheduling information
 */

import { ciscoConnectionService } from "@/services/cisco-connection-service";

export interface Booking {
  id: string;
  title: string;
  organizer: string;
  startTime: string;
  endTime: string;
  duration: number;
  privacy: "Public" | "Private";
  meetingPlatform?: string;
  dialInfo?: {
    number: string;
    protocol: string;
  };
}

export interface BookingsResponse {
  status: "OK" | "Error";
  bookings: Booking[];
}

/**
 * Get today's bookings for the device
 */
export async function getTodaysBookings(): Promise<BookingsResponse> {
  const connector = ciscoConnectionService.getConnector();

  if (!connector) {
    throw new Error("No device connection available");
  }

  try {
    // Get bookings for today only (DayOffset: 0, Days: 1)
    const result = await connector.command("Bookings.List", {
      DayOffset: 0,
      Days: 1,
      ScheduleType: "Upcoming", // Show only upcoming meetings
    });

    if (result.status === "OK" && result.Booking) {
      // Ensure we have an array
      const bookingsArray = Array.isArray(result.Booking) ? result.Booking : [result.Booking];

      const bookings: Booking[] = bookingsArray.map((booking: any) => ({
        id: booking.Id || "",
        title: booking.Title || "Untitled Meeting",
        organizer: booking.Organizer?.Name || "Unknown",
        startTime: booking.Time?.StartTime || "",
        endTime: booking.Time?.EndTime || "",
        duration: parseInt(booking.Time?.Duration || "0"),
        privacy: booking.Privacy || "Public",
        meetingPlatform: booking.MeetingPlatform || undefined,
        dialInfo: booking.DialInfo
          ? {
              number: booking.DialInfo.Number || "",
              protocol: booking.DialInfo.Protocol || "",
            }
          : undefined,
      }));

      return {
        status: "OK",
        bookings,
      };
    }

    return {
      status: "OK",
      bookings: [],
    };
  } catch (error) {
    return {
      status: "Error",
      bookings: [],
    };
  }
}

/**
 * Get current booking if any
 */
export async function getCurrentBooking(): Promise<Booking | null> {
  const connector = ciscoConnectionService.getConnector();

  if (!connector) {
    throw new Error("No device connection available");
  }

  try {
    // Get current/ongoing bookings
    const result = await connector.command("Bookings.List", {
      DayOffset: 0,
      Days: 1,
      ScheduleType: "Current",
    });

    if (result.status === "OK" && result.Booking) {
      const booking = Array.isArray(result.Booking) ? result.Booking[0] : result.Booking;

      if (booking) {
        return {
          id: booking.Id || "",
          title: booking.Title || "Untitled Meeting",
          organizer: booking.Organizer?.Name || "Unknown",
          startTime: booking.Time?.StartTime || "",
          endTime: booking.Time?.EndTime || "",
          duration: parseInt(booking.Time?.Duration || "0"),
          privacy: booking.Privacy || "Public",
          meetingPlatform: booking.MeetingPlatform || undefined,
          dialInfo: booking.DialInfo
            ? {
                number: booking.DialInfo.Number || "",
                protocol: booking.DialInfo.Protocol || "",
              }
            : undefined,
        };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}
