import prisma from '../config/database';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        department: true,
      },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        employeeCode: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        avatarUrl: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        department: true,
      },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
    departmentId?: string | null;
    employeeCode: string;
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.passwordHash,
        phone: data.phone || null,
        departmentId: data.departmentId || null,
        employeeCode: data.employeeCode,
      },
      select: {
        id: true,
        employeeCode: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        avatarUrl: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        department: true,
      },
    });
  }

  async updatePassword(userId: string, hash: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });
  }

  async generateEmployeeCode(): Promise<string> {
    const lastUser = await prisma.user.findFirst({
      orderBy: {
        employeeCode: 'desc',
      },
      select: {
        employeeCode: true,
      },
    });

    if (!lastUser) {
      return 'EMP-001';
    }

    const match = lastUser.employeeCode.match(/^EMP-(\d+)$/);
    if (!match) {
      return 'EMP-001';
    }

    const nextNum = parseInt(match[1], 10) + 1;
    const padded = String(nextNum).padStart(3, '0');
    return `EMP-${padded}`;
  }
}
export default AuthRepository;
