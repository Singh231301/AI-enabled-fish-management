import { PrismaClient, UserInvitation } from '@prisma/client';

export class UserInvitationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    invitedBy: string;
    email: string;
    role: any;
    token: string;
    expiresAt: Date;
    pondId?: string;
    message?: string;
  }): Promise<UserInvitation> {
    return this.prisma.userInvitation.create({
      data: {
        invitedBy: data.invitedBy,
        email: data.email,
        role: data.role,
        token: data.token,
        expiresAt: data.expiresAt,
        pondId: data.pondId,
        message: data.message
      }
    });
  }

  async findByToken(token: string): Promise<UserInvitation | null> {
    return this.prisma.userInvitation.findUnique({
      where: { token },
      include: {
        inviter: {
          select: { id: true, fullName: true, email: true }
        },
        pond: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async findPendingByEmail(email: string): Promise<UserInvitation[]> {
    return this.prisma.userInvitation.findMany({
      where: { 
        email,
        isAccepted: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });
  }

  async findByInviter(invitedBy: string): Promise<UserInvitation[]> {
    return this.prisma.userInvitation.findMany({
      where: { invitedBy },
      include: {
        pond: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async acceptInvitation(id: string): Promise<UserInvitation> {
    return this.prisma.userInvitation.update({
      where: { id },
      data: { 
        isAccepted: true,
        acceptedAt: new Date()
      }
    });
  }

  async delete(id: string): Promise<UserInvitation> {
    return this.prisma.userInvitation.delete({
      where: { id }
    });
  }
}
