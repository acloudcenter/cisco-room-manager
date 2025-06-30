/**
 * Bookings Display Component
 * Shows device bookings and scheduling information
 */

import type { ConnectedDevice } from "@/stores/device-store";
import type { Booking, BookingsResponse } from "@/lib/bookings";

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  CircularProgress,
  Button,
  Divider,
  Switch,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import { getTodaysBookings, getCurrentBooking } from "@/lib/bookings";

interface BookingsDisplayProps {
  device: ConnectedDevice;
}

export default function BookingsDisplay({ device }: BookingsDisplayProps) {
  const [bookingsData, setBookingsData] = React.useState<BookingsResponse | null>(null);
  const [currentBooking, setCurrentBooking] = React.useState<Booking | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [usePexipApi, setUsePexipApi] = React.useState(false);

  const loadBookings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Add logic to switch between Native and Pexip APIs based on usePexipApi state
      // For now, always use native API
      const [todaysBookings, current] = await Promise.all([
        getTodaysBookings(device),
        getCurrentBooking(device),
      ]);

      setBookingsData(todaysBookings);
      setCurrentBooking(current);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load bookings";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadBookings();
  }, [device, usePexipApi]);

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    try {
      const date = new Date(timeString);

      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeString;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }

    return `${mins}m`;
  };

  const isCurrentMeeting = (booking: Booking) => {
    return currentBooking?.id === booking.id;
  };

  const getMeetingStatus = (booking: Booking) => {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);

    if (now >= startTime && now <= endTime) {
      return "ongoing";
    } else if (now < startTime) {
      return "upcoming";
    } else {
      return "past";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-default-50">
        <CardBody className="flex flex-row items-center gap-3 p-4">
          <CircularProgress size="sm" />
          <div>
            <p className="text-xs font-medium">Loading Bookings...</p>
            <p className="text-xs text-default-500">Fetching today&apos;s schedule...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-danger-50 border-danger-200">
        <CardBody className="p-3">
          <div className="flex items-start gap-3">
            <Icon
              className="text-danger-500 mt-0.5"
              icon="solar:danger-circle-outline"
              width={16}
            />
            <div className="flex flex-col">
              <p className="text-xs font-medium text-danger-700">Failed to Load Bookings</p>
              <p className="text-xs text-danger-600 mt-1">{error}</p>
              <Button
                className="mt-2 w-fit"
                color="danger"
                size="sm"
                variant="light"
                onPress={loadBookings}
              >
                Retry
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="text-primary" icon="solar:calendar-outline" width={16} />
          <div>
            <h3 className="text-sm font-semibold">Today&apos;s Bookings</h3>
            <p className="text-xs text-default-500">{device?.info?.unitName || "Unknown Device"}</p>
          </div>
        </div>

        <Button
          size="sm"
          startContent={<Icon icon="solar:refresh-outline" width={16} />}
          variant="light"
          onPress={loadBookings}
        >
          Refresh
        </Button>
      </div>

      {/* API Toggle */}
      <Card>
        <CardBody className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Booking API</p>
              <p className="text-xs text-default-500">
                {usePexipApi ? "Using Pexip Booking API" : "Using Native Booking API"}
              </p>
            </div>
            <Switch
              aria-label="Toggle between Native and Pexip booking API"
              isSelected={usePexipApi}
              size="sm"
              onValueChange={setUsePexipApi}
            />
          </div>
        </CardBody>
      </Card>

      {/* Current Meeting Status */}
      {currentBooking && (
        <Card className="bg-primary-50 border-primary-200">
          <CardBody className="p-3">
            <div className="flex items-start gap-3">
              <Icon
                className="text-primary-500 mt-0.5"
                icon="solar:video-conference-bold"
                width={16}
              />
              <div className="flex-1">
                <p className="text-xs font-medium text-primary-700">Meeting in Progress</p>
                <p className="text-xs font-semibold mt-1">
                  {currentBooking.privacy === "Private" ? "Private Meeting" : currentBooking.title}
                </p>
                <p className="text-xs text-primary-600">
                  {formatTime(currentBooking.startTime)} - {formatTime(currentBooking.endTime)}
                  {currentBooking.organizer && ` • Organized by ${currentBooking.organizer}`}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Bookings List */}
      <Card>
        <CardHeader className="pb-1 pt-2 px-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium">Schedule</h4>
            <Chip size="sm" variant="flat">
              {bookingsData?.bookings.length || 0} meetings
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="pt-1 pb-3 px-3">
          {bookingsData?.bookings && bookingsData.bookings.length > 0 ? (
            <div className="space-y-3">
              {bookingsData.bookings.map((booking, index) => {
                const status = getMeetingStatus(booking);
                const isCurrent = isCurrentMeeting(booking);

                return (
                  <div key={booking.id || index}>
                    {index > 0 && <Divider />}
                    <div
                      className={`py-3 ${status === "past" ? "opacity-50" : ""} ${isCurrent ? "pl-3 border-l-3 border-primary" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium">
                              {booking.privacy === "Private" ? (
                                <span className="text-default-500">Private Meeting</span>
                              ) : (
                                booking.title
                              )}
                            </p>
                            {isCurrent && (
                              <Chip color="primary" size="sm" variant="flat">
                                Now
                              </Chip>
                            )}
                          </div>
                          <p className="text-xs text-default-500 mt-1">
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            <span className="text-default-400">
                              {" "}
                              • {formatDuration(booking.duration)}
                            </span>
                          </p>
                          {booking.organizer && booking.privacy !== "Private" && (
                            <p className="text-xs text-default-400 mt-1">
                              Organizer: {booking.organizer}
                            </p>
                          )}
                          {booking.meetingPlatform && (
                            <p className="text-xs text-default-400 mt-1">
                              Platform: {booking.meetingPlatform}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center">
                          {status === "ongoing" && (
                            <Chip color="success" size="sm" variant="dot">
                              Ongoing
                            </Chip>
                          )}
                          {status === "upcoming" && (
                            <Chip color="primary" size="sm" variant="flat">
                              Upcoming
                            </Chip>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Icon
                className="text-default-300 mb-3"
                icon="solar:calendar-minimalistic-outline"
                width={32}
              />
              <p className="text-xs text-default-500">No bookings scheduled for today</p>
              <p className="text-xs text-default-400 mt-1">The room is available</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
