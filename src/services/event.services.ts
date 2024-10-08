import { createResult } from "../common/result"
import { eventRepository, eventUserRepository, userRepository } from "../models/prismaClient"
import { EventDataProps, EventProps, EventUserStatusCheckerProps } from "../resource/event.resource"

async function getEventsByOrganizer(userId: string) {
  const organizedEvents = await eventRepository.findMany({
    include: {
      EventUser: {
        select: {
          role: true,
          user: {
            select: {
              name: true,
              picture: true
            }
          }
        },
        where: {
          role: "PARTICIPANT"
        },
        take: 3
      },
      _count: {
        select: {
          EventUser: true
        }
      }
    },
    where: {
      EventUser: {
        some: {
          userId,
          role: 'ORGANIZER'
        },
      }
    },
    orderBy: {
      startDateTime: "asc"
    }
  })

  const createdEvents = await userRepository.findMany({
    select: {
      _count: {
        select: {
          EventUser: {
            where: {
              userId: userId,
              role: "ORGANIZER"
            }
          }
        }
      }
    },
    where: {
      id: userId
    }
  })
  const invitedPeopleEvents = await eventRepository.findMany({
    select: {
      _count: {
        select: {
          EventUser: {
            where: {
              role: "PARTICIPANT",
            }
          },
        }
      }
    },
    where: {
      EventUser: {
        some: {
          userId,
          role: "ORGANIZER"
        }
      }
    }
  })
  const invitedEventsObj = await userRepository.findMany({
    select: {
      _count: {
        select: {
          EventUser: {
            where: {
              userId,
              role: "PARTICIPANT"
            }
          }
        }
      }
    }
  })

  const invitedEvents = await eventRepository.findMany({
    where: {
      EventUser: {
        some: {
          userId,
          role: "PARTICIPANT"
        },
      }
    },
    orderBy: {
      startDateTime: "asc"
    }
  })

  if (!invitedEvents) {
    return createResult(null, "Eventos não encontrados")
  }

  const invitedPeople = invitedPeopleEvents.reduce((acc, value) => {
    return value._count.EventUser + acc
  }, 0)
  const invitedEventsCount = invitedEventsObj.reduce((acc, value) => {
    return value._count.EventUser + acc
  }, 0)

  const metrics = { createdEvents: createdEvents[0]._count.EventUser, invitedPeople, invitedEventsCount }

  if (!organizedEvents) {
    return createResult(null, "Eventos não encontrados")
  }

  return createResult({ organizedEvents, invitedEvents, metrics }, null)
}

async function saveEvent(eventData: EventDataProps, userId: string) {
  const startDateTime = new Date(eventData.startDateTime)
  const endDateTime = new Date(eventData.endDateTime)

  if (startDateTime < new Date()) {
    return createResult(null, "Event cannot be created with a past start date")
  }

  const event = await eventRepository.create({
    data: {
      name: eventData.name,
      description: eventData.description,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      address: eventData.address,
      EventUser: {
        create: {
          userId: userId,
          role: "ORGANIZER"
        }
      }
    }
  })

  if (!event) {
    return createResult(null, "Eventos não encontrados")
  }

  return createResult(event, null)

}

async function getOrganizedEvent(eventId: string, userId: string) {
  const event = await eventRepository.findFirst({
    include: {
      _count: {
        select: {
          EventUser: true,
          EventInvitation: {
            where: {
              status: "PENDING"
            }
          }
        }
      },
      EventUser: {
        select: {
          role: true,
          eventUserStatus: true,
          user: {
            select: {
              name: true,
              email: true,
              picture: true,
            }
          }
        },
      },
      EventInvitation: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              picture: true
            }
          }
        },
        where: {
          status: "PENDING"
        }
      }
    },
    where: {
      id: eventId,
      EventUser: {
        some: {
          userId,
          role: "ORGANIZER"
        }
      }
    }
  })

  if (!event) {
    return createResult(null, "Evento não encontrado")
  }

  return createResult(event, null)
}

async function getInvitedEvent(eventId: string, userId: string) {
  const event = await eventRepository.findFirst({
    include: {
      EventUser: {
        select: {
          id: true,
        },
        where: {
          userId
        }
      }
    },
    where: {
      id: eventId,
      EventUser: {
        some: {
          userId,
          role: "PARTICIPANT"
        }
      }
    }
  })

  if (!event) {
    return createResult(null, "Evento não encontrado")
  }

  return createResult(event, null)
}

async function getEvent(eventId: string) {
  const event = await eventRepository.findFirst({
    select: {
      EventUser: {
        select: {
          role: true,
          userId: true
        }
      }
    },
    where: {
      id: eventId
    }
  })

  if (!event) {
    return createResult(null, "Evento não encontrado")
  }

  return createResult(event, null)
}

async function addUserToEvent(eventId: string, guestId: string) {
  const event = await eventRepository.update({
    data: {
      EventUser: {
        create: {
          role: "PARTICIPANT",
          userId: guestId
        }
      }
    },
    where: {
      id: eventId
    }
  })

  if (!event) {
    return createResult(null, "Erro ao atualizar evento")
  }

  return createResult(event, null)
}

async function getEventInvitedEventRequest(id: string) {
  const event = await eventRepository.findFirst({
    select: {
      name: true,
      description: true,
      startDateTime: true,
      address: true,
      EventUser: {
        select: {
          user: {
            select: {
              name: true,
              picture: true,
            }
          }
        },
        where: {
          role: "ORGANIZER"
        }
      }
    },
    where: {
      id
    }
  })

  if (!event) {
    return createResult(null, "Erro ao atualizar evento")
  }

  return createResult(event, null)
}

function eventsWithStatus(events: EventProps[]) {
  return events
    .map(event => ({
      ...event,
      status: eventServices.getEventStatus(event.startDateTime, event.endDateTime),
    }));
}

function singleEventWithStatus(event: EventProps) {
  return {
    ...event,
    status: eventServices.getEventStatus(event.startDateTime, event.endDateTime),

  }
}

function getEventStatus(startDateTime: Date, endDateTime: Date) {
  const now = Date.now();

  if (endDateTime.getTime() < now) {
    return "COMPLETED";
  }

  if (startDateTime.getTime() <= now) {
    return "ONGOING";
  }

  return "SCHEDULED";
}

async function getEventUserByIds(eventId: string, eventUserId: string) {
  const eventUser = await eventUserRepository.findUnique({
    include: {
      event: {
        select: {
          startDateTime: true,
          endDateTime: true,
        }
      }
    },
    where: {
      eventId,
      id: eventUserId
    }
  })

  if (!eventUser) {
    return createResult(null, "Usuário não faz parte do evento")
  }

  return createResult(eventUser, null)
}

async function getEventByOrganizerAndEventId(eventId: string, userId: string) {
  const eventUser = await eventRepository.findUnique({
    where: {
      EventUser: {
        some: {
          userId,
          role: "ORGANIZER"
        }
      },
      id: eventId
    }
  })

  if (!eventUser) {
    return createResult(null, "Usuário sem permissão")
  }

  return createResult(eventUser, null)
}

async function updateEventUser(eventUserId: string) {
  const eventUser = await eventUserRepository.update({
    data: {
      checkInTime: new Date(),
      eventUserStatus: EventUserStatus.CHECKED_IN
    },
    where: {
      id: eventUserId
    }
  })

  if (!eventUser) {
    return createResult(null, "Erro ao atualizar usuário")
  }

  return createResult(eventUser, null)
}

async function getEventUserStatus(eventUser: EventUserStatusCheckerProps){

  const dateNow = new Date()

  if(eventUser.checkInTime === null) {
    await eventUserRepository.update({
      data: {
        eventUserStatus: EventUserStatus.ACCEPTED
      },
      where: {
        id: eventUser.id
      }
    })
    return EventUserStatus.ACCEPTED
  }

  if(eventUser.event.startDateTime  >= dateNow && eventUser.event.endDateTime < new Date()) {
    await eventUserRepository.update({
      data: {
        eventUserStatus: EventUserStatus.NO_SHOW
      },
      where: {
        id: eventUser.id
      }
    })
    return EventUserStatus.NO_SHOW
  }

  await eventUserRepository.update({
    data: {
      eventUserStatus: EventUserStatus.CHECKED_IN
    },
    where: {
      id: eventUser.id
    }
  })
  return EventUserStatus.CHECKED_IN
  
}

enum EventUserStatus {
  ACCEPTED = "ACCEPTED",  
  CHECKED_IN = "CHECKED_IN",  
  NO_SHOW = "NO_SHOW", 
  CANCELLED = "CANCELLED"
}

export const eventServices = {
  getEvent,
  getEventsByOrganizer,
  getEventStatus,
  eventsWithStatus,
  saveEvent,
  getOrganizedEvent,
  singleEventWithStatus,
  getInvitedEvent,
  addUserToEvent,
  getEventInvitedEventRequest,
  getEventUserByIds,
  getEventByOrganizerAndEventId,
  updateEventUser,
  getEventUserStatus
}