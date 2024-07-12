import { RouteGenericInterface } from "fastify";

export interface GetEventsRequest extends RouteGenericInterface {
  Params: {
    userId: string;
  };
}

export interface GetEventRequest extends RouteGenericInterface {
  Params: {
    eventId: string;
    userId: string;
  };
}

export interface EventProps {
  id: string;
  name: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  address: string;
  createdAt: Date;
}

export interface EventDataProps {
  name: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  address: string;
}

export interface PostEventRequest extends RouteGenericInterface {
  Body: {
    eventData: EventDataProps
    userId: string;
  }
}

export function obterStatus(startDateTime: Date, endDateTime: Date): EventStatus {
  if (endDateTime < new Date()) {
    return EventStatus.COMPLETED;
  }

  if (startDateTime >= new Date()) {
    return EventStatus.ONGOING;
  }

  return EventStatus.SCHEDULED;
}

enum EventStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED'
}