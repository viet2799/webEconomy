import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Kiểm tra xem username hoặc email đã tồn tại chưa
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Tạo user mới
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Không trả về password
      },
    });

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Không trả về password
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Không trả về password
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Kiểm tra user có tồn tại không
    await this.findOne(id);

    // Nếu có password mới, hash nó
    const updateData = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Kiểm tra username hoặc email có bị trùng không (nếu có thay đổi)
    if (updateUserDto.username || updateUserDto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } }, // Không tính user hiện tại
            {
              OR: [
                { username: updateUserDto.username },
                { email: updateUserDto.email },
              ].filter(Boolean), // Chỉ check những field được update
            },
          ],
        },
      });

      if (existingUser) {
        throw new ConflictException('Username or email already exists');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Không trả về password
      },
    });

    return updatedUser;
  }

  async remove(id: string) {
    // Kiểm tra user có tồn tại không
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: `User with ID ${id} has been deleted` };
  }
}
