import { createResult } from "@common/result"
import { eventInvitationRepository } from "@models/prismaClient"
import { EventInvitationStatus } from "@prisma/client"

async function getInvitationByEventId(eventId: string) {
  const invitations = await eventInvitationRepository.findMany({
    select: {
      id: true,
      user: {
        select: {
          name: true,
          picture: true,
          id: true
        }
      }
    },
    where: {
      eventId,
      status: "PENDING"
    }
  })

  if (!invitations) {
    return createResult(null, "Evento não encontrado")
  }

  return createResult(invitations, null)
}

async function getIfGuestWasApproved(eventId: string, guestId: string) {
  const invitation = await eventInvitationRepository.findFirst({
    select: {
      id: true,
      status: true,
      user: {
        select: {
          name: true,
          picture: true,
          id: true
        }
      }
    },
    where: {
      eventId,
      userId: guestId,
      OR: [
        {
          status: "APPROVED"
        },
        {
          status: "PENDING"
        }
      ]

    }
  })

  if (!invitation) {
    return createResult(null, "Convite não encontrado")
  }

  return createResult(invitation, null)
}

async function getInvitationById(id: string) {
  const invitation = await eventInvitationRepository.findFirst({
    where: {
      id,
      status: "PENDING"
    }
  })

  if (!invitation) {
    return createResult(null, "Convite não encontrado")
  }

  return createResult(invitation, null)

}

async function updateInvitation(id: string, status: EventInvitationStatus) {
  const invitation = await eventInvitationRepository.update({
    data: {
      status
    },
    where: {
      id
    }
  })

  if (!invitation) {
    return createResult(null, "Erro ao atualizar solicitação")
  }

  return createResult(invitation, null)
}

async function getInvitationIfUserOrganizer(id: string, organizerId: string) {
  const invitation = await eventInvitationRepository.findFirst({
    select: {
      event: {
        select: {
          EventUser: {
            where: {
              role: "ORGANIZER"
            }
          }
        }
      }
    },
    where: {
      id,
      event: {
        EventUser: {
          some: {
            userId: organizerId,
            role: "ORGANIZER"
          }
        }
      }
    }
  })
  if (!invitation) {
    return createResult(null, "Usuário não tem permissão")
  }

  return createResult(invitation, null)

}

async function getCountInvitationsByOrganizer(organizerId: string) {
  const invitation = await eventInvitationRepository.count({
    where: {
      status: "PENDING",
      event: {
        EventUser: {
          some: {
            userId: organizerId,
            role: "ORGANIZER"
          }
        }
      }
    }
  })
  if (!invitation) {
    return createResult(0, null)
  }

  return createResult(invitation, null)

}
async function getInvitationsByOrganizer(organizerId: string) {
  const invitation = await eventInvitationRepository.findMany({
    select: {
      event: {
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              EventInvitation: {
                where: {
                  status: "PENDING"
                }
              }
            }
          }

        }
      }
    },
    where: {
      status: "PENDING",
      event: {
        EventUser: {
          some: {
            userId: organizerId,
            role: "ORGANIZER"
          }
        }
      }
    }
  })
  if (!invitation) {
    return createResult("Nenhuma solicitação", null)
  }

  return createResult(invitation, null)

}

async function createInvitation(eventId: string, guestId: string) {
  const eventInvitation = await eventInvitationRepository.create({
    data: {
      status: "PENDING",
      eventId,
      userId: guestId
    }
  })

  if (!eventInvitation) {
    return createResult(null, "Evento não encontrado")
  }

  return createResult(eventInvitation, null)
}

export const eventInvitationServices = {
  getInvitationByEventId,
  createInvitation,
  getIfGuestWasApproved,
  getInvitationById,
  getInvitationIfUserOrganizer,
  updateInvitation,
  getCountInvitationsByOrganizer,
  getInvitationsByOrganizer
}