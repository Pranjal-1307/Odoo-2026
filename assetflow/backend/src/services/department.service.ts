import DepartmentRepository from '../repositories/department.repository';
import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { logActivity } from '../middlewares/activityLogger';
import { PaginationParams } from '../types';

const departmentRepository = new DepartmentRepository();

export class DepartmentService {
  async getAllDepartments(params: PaginationParams & { status?: string }) {
    return departmentRepository.findAll(params);
  }

  async getDepartmentById(id: string) {
    const dept = await departmentRepository.findById(id);
    if (!dept) {
      throw AppError.notFound('Department not found');
    }
    return dept;
  }

  async createDepartment(data: any, userId: string) {
    const existing = await prisma.department.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw AppError.conflict('Department with this name already exists');
    }

    if (data.parentId) {
      const parent = await prisma.department.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw AppError.badRequest('Parent department does not exist');
      }
    }

    if (data.headId) {
      const headUser = await prisma.user.findUnique({
        where: { id: data.headId },
      });
      if (!headUser) {
        throw AppError.badRequest('Department head user does not exist');
      }
    }

    const dept = await departmentRepository.create(data);

    // If head is assigned, make sure their role is DEPARTMENT_HEAD
    if (data.headId) {
      await prisma.user.update({
        where: { id: data.headId },
        data: { role: 'DEPARTMENT_HEAD' },
      });
    }

    await logActivity({
      userId,
      action: 'CREATE',
      entity: 'Department',
      entityId: dept.id,
      details: { name: dept.name },
    });

    return dept;
  }

  async updateDepartment(id: string, data: any, userId: string) {
    const dept = await departmentRepository.findById(id);
    if (!dept) {
      throw AppError.notFound('Department not found');
    }

    if (data.name && data.name !== dept.name) {
      const existing = await prisma.department.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        throw AppError.conflict('Department with this name already exists');
      }
    }

    if (data.parentId) {
      if (data.parentId === id) {
        throw AppError.badRequest('A department cannot be its own parent');
      }
      const parent = await prisma.department.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw AppError.badRequest('Parent department does not exist');
      }
    }

    if (data.headId) {
      const headUser = await prisma.user.findUnique({
        where: { id: data.headId },
      });
      if (!headUser) {
        throw AppError.badRequest('Department head user does not exist');
      }
    }

    const updated = await departmentRepository.update(id, data);

    if (data.headId && data.headId !== dept.headId) {
      await prisma.user.update({
        where: { id: data.headId },
        data: { role: 'DEPARTMENT_HEAD' },
      });
    }

    await logActivity({
      userId,
      action: 'UPDATE',
      entity: 'Department',
      entityId: id,
      details: { name: updated.name },
    });

    return updated;
  }

  async deactivateDepartment(id: string, userId: string) {
    const dept = await departmentRepository.findById(id);
    if (!dept) {
      throw AppError.notFound('Department not found');
    }

    const activeEmployees = dept.employees.filter(e => e.status === 'ACTIVE');
    if (activeEmployees.length > 0) {
      throw AppError.badRequest('Cannot deactivate a department with active employees');
    }

    const updated = await departmentRepository.deactivate(id);

    await logActivity({
      userId,
      action: 'DEACTIVATE',
      entity: 'Department',
      entityId: id,
      details: { name: dept.name },
    });

    return updated;
  }

  async getDepartmentHierarchy() {
    const list = await departmentRepository.getHierarchy();
    
    // helper to build tree recursively
    const buildTree = (parentId: string | null = null): any[] => {
      return list
        .filter(item => item.parentId === parentId)
        .map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          status: item.status,
          parentId: item.parentId,
          head: item.head,
          employeesCount: item._count?.employees || 0,
          children: buildTree(item.id),
        }));
    };

    return buildTree(null);
  }
}

export default DepartmentService;
