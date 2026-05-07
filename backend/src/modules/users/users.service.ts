import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import type { Prisma, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from '../notifications/notifications.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private aiService: AiService,
  ) { }

  async create(userData: any) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    return (this.prisma.user as any).create({ data: userData });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByPhoneNumber(phonenumber: string) {
    return this.prisma.user.findUnique({ where: { phonenumber } });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getMainAdminId(): Promise<number | null> {
    const mainAdmin = await this.prisma.user.findFirst({
      where: { roles: { has: 'ADMIN' } },
      orderBy: { id: 'asc' }
    });
    return mainAdmin ? mainAdmin.id : null;
  }

  async findAll(vendorRequestPending?: boolean, driverRequestPending?: boolean) {
    const where: Prisma.UserWhereInput = {};
    if (vendorRequestPending !== undefined) {
      where.vendorRequestPending = vendorRequestPending;
    }
    if (driverRequestPending !== undefined) {
      where.driverRequestPending = driverRequestPending;
    }

    const users = await (this.prisma.user as any).findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    for (const user of users) {
      if (user.lockUntil && user.lockUntil < now) {
        user.isActive = true;
        user.lockedRoles = [];
        user.lockUntil = null;
        user.roleLockReasons = null;
        
        (this.prisma.user as any).update({
          where: { id: user.id },
          data: { isActive: true, lockedRoles: [], roleLockReasons: null, lockUntil: null, lockReason: null }
        }).catch((e: any) => console.error("Auto unlock error", e));
      }
    }

    return users;
  }

  async searchUsers(query: string) {
    if (!query) return [];
    return (this.prisma.user as any).findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { phonenumber: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        phonenumber: true
      },
      take: 10
    });
  }

  async getSupportAdmin(userId: number) {
    // 1. Kiểm tra xem user này đã từng chat với Admin nào trong vòng 24h qua chưa
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingConversations = await this.prisma.conversation.findMany({
      where: {
        updatedAt: {
          gte: twentyFourHoursAgo
        },
        participants: {
          some: { id: userId }
        }
      },
      include: {
        participants: true
      }
    });

    for (const conv of existingConversations) {
      const adminInConv = conv.participants.find(p => p.roles.includes('ADMIN') && p.id !== userId);
      if (adminInConv) {
        return { id: adminInConv.id, username: adminInConv.username, avatar: adminInConv.avatar };
      }
    }

    // 2. Nếu chưa từng chat, lấy danh sách Admin và random 1 người để chia đều tải
    const admins = await this.prisma.user.findMany({
      where: { roles: { has: 'ADMIN' } },
      select: { id: true, username: true, avatar: true }
    });
    if (!admins.length) throw new BadRequestException('Không tìm thấy tài khoản hỗ trợ');
    
    const randomAdmin = admins[Math.floor(Math.random() * admins.length)];
    return randomAdmin;
  }

  async updateStatus(id: number, isApprovedVendor: boolean) {
    const user = await (this.prisma.user as any).update({
      where: { id },
      data: {
        isApprovedVendor,
        vendorRequestPending: false,
        pendingRequestType: null
      }
    });

    await this.notifications.create(id, {
      type: 'SYSTEM' as any,
      content: isApprovedVendor
        ? 'Chúc mừng! Tài khoản Vendor của bạn đã được phê duyệt.'
        : 'Rất tiếc, yêu cầu đăng ký làm Nhà cung cấp (Vendor) của bạn đã bị từ chối.',
      link: '/profile',
    });

    return user;
  }

  async applyVendor(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    if (user.isApprovedVendor) throw new BadRequestException('Bạn đã là Nhà cung cấp');
    if (user.vendorRequestPending) throw new BadRequestException('Yêu cầu của bạn đang chờ xử lý');

    await (this.prisma.user as any).update({
      where: { id: userId },
      data: {
        vendorRequestPending: true,
        pendingRequestType: 'VENDOR_REGISTRATION'
      }
    });

    // Thông báo cho Admin
    const admins = await this.prisma.user.findMany({ where: { roles: { has: 'ADMIN' } } });
    for (const admin of admins) {
      await this.notifications.create(admin.id, {
        type: 'SYSTEM' as any,
        content: `Người dùng ${user.username} đã gửi yêu cầu đăng ký làm Nhà cung cấp (Vendor).`,
        link: '/admin/users', // Giả định có trang quản lý user
      });
    }

    return { message: 'Đã gửi yêu cầu đăng ký thành công' };
  }

  async updateDriverStatus(id: number, isApprovedDriver: boolean) {
    const user = await (this.prisma.user as any).update({
      where: { id },
      data: {
        isApprovedDriver,
        driverRequestPending: false,
        pendingRequestType: null,
        roles: isApprovedDriver ? { push: 'DRIVER' } : undefined
      }
    });

    await this.notifications.create(id, {
      type: 'SYSTEM' as any,
      content: isApprovedDriver
        ? 'Chúc mừng! Yêu cầu đăng ký Tài xế của bạn đã được phê duyệt.'
        : 'Rất tiếc, yêu cầu đăng ký Tài xế của bạn đã bị từ chối.',
      link: '/profile',
    });

    return user;
  }

  async applyDriver(userId: number, driverData?: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } }) as any;
    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    if (user.isApprovedDriver || user.roles.includes('DRIVER')) throw new BadRequestException('Bạn đã là Tài xế');
    if (user.driverRequestPending) throw new BadRequestException('Yêu cầu của bạn đang chờ xử lý');

    if (driverData) {
      if (!driverData.idCardFrontUrl || !driverData.idCardBackUrl || !driverData.licenseFrontUrl || !driverData.licenseBackUrl || !driverData.criminalRecordUrl) {
          throw new BadRequestException('Vui lòng tải lên đầy đủ tất cả các giấy tờ bắt buộc (CCCD 2 mặt, GPLX 2 mặt, Lý lịch tư pháp).');
      }

      if (driverData.avatarUrl) {
        const check = await this.aiService.verifyDocumentImage(driverData.avatarUrl, 'Ảnh chân dung');
        if (!check.isValid) throw new BadRequestException(`Ảnh chân dung không hợp lệ: ${check.reason}`);
      }
      if (driverData.idCardFrontUrl) {
        const check = await this.aiService.verifyDocumentImage(driverData.idCardFrontUrl, 'Căn cước công dân (Mặt trước)');
        if (!check.isValid) throw new BadRequestException(`Ảnh Căn cước công dân (Mặt trước) không hợp lệ: ${check.reason}`);
      }
      if (driverData.idCardBackUrl) {
        const check = await this.aiService.verifyDocumentImage(driverData.idCardBackUrl, 'Căn cước công dân (Mặt sau)');
        if (!check.isValid) throw new BadRequestException(`Ảnh Căn cước công dân (Mặt sau) không hợp lệ: ${check.reason}`);
      }
      if (driverData.licenseFrontUrl) {
        const check = await this.aiService.verifyDocumentImage(driverData.licenseFrontUrl, 'Giấy phép lái xe (Mặt trước)');
        if (!check.isValid) throw new BadRequestException(`Ảnh Giấy phép lái xe (Mặt trước) không hợp lệ: ${check.reason}`);
      }
      if (driverData.licenseBackUrl) {
        const check = await this.aiService.verifyDocumentImage(driverData.licenseBackUrl, 'Giấy phép lái xe (Mặt sau)');
        if (!check.isValid) throw new BadRequestException(`Ảnh Giấy phép lái xe (Mặt sau) không hợp lệ: ${check.reason}`);
      }
      if (driverData.criminalRecordUrl) {
        const check = await this.aiService.verifyDocumentImage(driverData.criminalRecordUrl, 'Lý lịch tư pháp (Giấy chứng nhận tiền án tiền sự)');
        if (!check.isValid) throw new BadRequestException(`Ảnh Lý lịch tư pháp không hợp lệ: ${check.reason}`);
      }
    }

    await (this.prisma.user as any).update({
      where: { id: userId },
      data: {
        driverRequestPending: true,
        pendingRequestType: 'DRIVER_REGISTRATION'
      }
    });

    if (driverData) {
      let profile = await this.prisma.serviceProfile.findUnique({ where: { userId } });
      if (!profile) {
        profile = await this.prisma.serviceProfile.create({
          data: {
            userId,
            serviceType: 'DRIVER'
          }
        });
      }

      await this.prisma.driverRentalService.create({
        data: {
          profileId: profile.id,
          name: driverData.name || user.username,
          dob: driverData.dob,
          experienceYears: driverData.experienceYears ? Number(driverData.experienceYears) : 0,
          pricePerKm: driverData.pricePerKm ? Number(driverData.pricePerKm) : 0,
          avatarUrl: driverData.avatarUrl,
          licenseFrontUrl: driverData.licenseFrontUrl,
          licenseBackUrl: driverData.licenseBackUrl,
          idCardFrontUrl: driverData.idCardFrontUrl,
          idCardBackUrl: driverData.idCardBackUrl,
          criminalRecordUrl: driverData.criminalRecordUrl,
          
          // 1. Thông tin cá nhân mới
          idCardNumber: driverData.idCardNumber,
          phoneNumber: driverData.phoneNumber,
          email: driverData.email,
          currentAddress: driverData.currentAddress,

          // 2. Thông tin bằng lái
          licenseType: driverData.licenseType,
          licenseNumber: driverData.licenseNumber,
          licenseIssueDate: driverData.licenseIssueDate,
          licenseExpiryDate: driverData.licenseExpiryDate,
          hasServiceExperience: driverData.hasServiceExperience === true || driverData.hasServiceExperience === 'true',

          // 3. Lý lịch & An toàn
          hasCriminalRecord: driverData.hasCriminalRecord === true || driverData.hasCriminalRecord === 'true',
          healthConditionValid: driverData.healthConditionValid === true || driverData.healthConditionValid === 'true',

          // 4. Khu vực hoạt động
          operatingCities: Array.isArray(driverData.operatingCities) ? driverData.operatingCities : (driverData.operatingCities ? [driverData.operatingCities] : []),
          workType: driverData.workType,
          workShifts: Array.isArray(driverData.workShifts) ? driverData.workShifts : (driverData.workShifts ? [driverData.workShifts] : []),

          // 5. Thông tin thanh toán
          bankAccountNumber: driverData.bankAccountNumber,
          bankName: driverData.bankName,
          bankAccountName: driverData.bankAccountName,

          // 6. Thiết bị & kết nối
          hasSmartphone: driverData.hasSmartphone !== false && driverData.hasSmartphone !== 'false',
          osPlatform: driverData.osPlatform,
          hasMobileData: driverData.hasMobileData !== false && driverData.hasMobileData !== 'false',

          // 8. Điều khoản & cam kết
          agreedToTerms: driverData.agreedToTerms === true || driverData.agreedToTerms === 'true',
          agreedToNoAlcohol: driverData.agreedToNoAlcohol === true || driverData.agreedToNoAlcohol === 'true',
          agreedToResponsibility: driverData.agreedToResponsibility === true || driverData.agreedToResponsibility === 'true',

          // 9. Thông tin thêm (Optional)
          bio: driverData.bio,
          languages: Array.isArray(driverData.languages) ? driverData.languages : (driverData.languages ? [driverData.languages] : []),

          status: 'Chờ duyệt'
        }
      });
    }

    const admins = await this.prisma.user.findMany({ where: { roles: { has: 'ADMIN' } } });
    for (const admin of admins) {
      await this.notifications.create(admin.id, {
        type: 'SYSTEM' as any,
        content: `Người dùng ${user.username} đã gửi yêu cầu đăng ký làm Tài xế.`,
        link: '/admin/users',
      });
    }

    return { message: 'Đã gửi yêu cầu đăng ký thành công' };
  }

  async switchRole(userId: number, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } }) as any;
    if (!user) throw new BadRequestException('Người dùng không tồn tại');

    if (role === 'VENDOR' && !user.isApprovedVendor) {
      throw new BadRequestException('Tài khoản chưa được phê duyệt quyền Vendor');
    }
    if (role === 'DRIVER' && !user.isApprovedDriver) {
      throw new BadRequestException('Tài khoản chưa được phê duyệt quyền Tài xế');
    }

    if (user.roles?.includes(role)) {
        return user;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { roles: { push: role as any } }
    });
  }

  async updateRole(id: number, roles: any) {
    return this.prisma.user.update({
      where: { id },
      data: { roles }
    });
  }

  async toggleActive(id: number, reason?: string, lockType: 'FULL' | 'PARTIAL' = 'FULL', lockedRoles?: string[], lockDurationDays?: number, roleReasons?: Record<string, string>) {
    const user = await this.prisma.user.findUnique({ where: { id } }) as any;
    
    let lockUntil: Date | null = null;
    if (lockDurationDays && lockDurationDays > 0) {
      lockUntil = new Date();
      lockUntil.setDate(lockUntil.getDate() + lockDurationDays);
    }

    if (lockType === 'PARTIAL') {
      const isUnlockingPartial = !lockedRoles || lockedRoles.length === 0;
      
      const newRoleLockReasons: any = isUnlockingPartial ? null : {};
      if (!isUnlockingPartial && lockedRoles) {
        for (const role of lockedRoles) {
          newRoleLockReasons[role] = roleReasons?.[role] || reason || 'Vi phạm quy định đối với vai trò này';
        }
      }

      return (this.prisma.user as any).update({
        where: { id },
        data: {
          isActive: true, // partial lock means account is still active overall
          lockedRoles: lockedRoles || [],
          roleLockReasons: newRoleLockReasons,
          lockUntil: isUnlockingPartial ? null : lockUntil,
        }
      });
    }

    const newIsActive = !user.isActive;
    return (this.prisma.user as any).update({
      where: { id },
      data: { 
        isActive: newIsActive,
        lockReason: newIsActive ? null : (reason || 'Vi phạm chính sách cộng đồng'),
        lockedRoles: [],
        roleLockReasons: null,
        lockUntil: newIsActive ? null : lockUntil
      }
    });
  }

  findByResetToken(token: string) {
    return this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date()
        },
      },
    });
  }

  async update(id: number, data: any) {
    if (!id || isNaN(Number(id))) {
      throw new BadRequestException(`ID người dùng không hợp lệ: ${id}`);
    }

    try {
      const updateData: any = {};

      // Chỉ lấy các trường hợp lệ để tránh lỗi Prisma
      if (data.username !== undefined) updateData.username = data.username;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.avatar !== undefined) updateData.avatar = data.avatar;
      if (data.qrCodeUrl !== undefined) updateData.qrCodeUrl = data.qrCodeUrl;

      if (data.phonenumber !== undefined) {
        updateData.phonenumber = data.phonenumber === "" ? null : data.phonenumber;
      }
      
      if (data.roles !== undefined) {
        updateData.roles = data.roles;
        
        if (data.roles.includes('VENDOR')) {
          updateData.isApprovedVendor = true;
          updateData.vendorRequestPending = false;
        } else {
          updateData.isApprovedVendor = false;
        }

        if (data.roles.includes('DRIVER')) {
          updateData.isApprovedDriver = true;
          updateData.driverRequestPending = false;
        } else {
          updateData.isApprovedDriver = false;
        }
      }

      if (data.password && typeof data.password === 'string' && data.password !== "") {
        updateData.password = await bcrypt.hash(data.password, 10);
      }


      const updatedUser = await (this.prisma.user as any).update({
        where: { id: Number(id) },
        data: updateData,
      });

      if (updatedUser) {
        // Return updated user directly
      }

      return updatedUser;
    } catch (error) {
      console.error(`[UsersService] Lỗi cập nhật User ID ${id}:`, error);
      throw new BadRequestException('Không thể cập nhật thông tin người dùng. ' + error.message);
    }
  }

  async saveResetToken(id: number, token: string, expires: Date) {
    return this.prisma.user.update({
      where: { id },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });
  }

  async getProfile(userId: number) {
    const user = await (this.prisma.user as any).findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        phonenumber: true,
        avatar: true,
        qrCodeUrl: true,
        roles: true,
        isApprovedVendor: true,
        vendorRequestPending: true,
        isApprovedDriver: true,
        driverRequestPending: true,
        pendingRequestType: true,
        lockedRoles: true,
        roleLockReasons: true,
        lockUntil: true,
        createdAt: true,
        serviceProfiles: {
          select: {
            driverRentalServices: true,
          }
        }
      }
    });

    if (user && user.lockUntil && user.lockUntil < new Date()) {
      user.isActive = true;
      user.lockedRoles = [];
      user.lockUntil = null;
      user.roleLockReasons = null;
      
      (this.prisma.user as any).update({
        where: { id: userId },
        data: { isActive: true, lockedRoles: [], roleLockReasons: null, lockUntil: null, lockReason: null }
      }).catch((e: any) => console.error("Auto unlock error", e));
    }

    // No longer filtering locked roles so user can view dashboard
    return user;
  }

  async delete(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async findVendors() {
    return this.prisma.user.findMany({
      where: { roles: { has: 'VENDOR' } },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
      },
      orderBy: { username: 'asc' }
    });
  }

  async findVendorPublicProfile(id: number) {
    const vendor = await (this.prisma.user as any).findFirst({
      where: {
        id: Number(id),
        isApprovedVendor: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
        roles: true,
        products: {
          where: { status: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            brand: true,
            year: true,
            mileage: true,
            condition: true,
          }
        },
      },
    });

    if (!vendor) {
      throw new BadRequestException('Không tìm thấy nhà cung cấp hoặc tài khoản chưa được xác minh.');
    }

    // Lấy thông tin review bổ sung
    const allReviews = await this.prisma.review.findMany({
      where: { targetId: Number(id) }
    });

    const ratingRecords = allReviews.filter(r => r.rating > 0);
    const totalRatings = ratingRecords.length;
    const averageRating = totalRatings > 0
      ? Number((ratingRecords.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1))
      : 0.0; // Default to 0.0 if no ratings yet

    return {
      ...vendor,
      averageRating,
      totalRatings
    };
  }

  async findDriverPublicProfile(id: number) {
    const driver = await (this.prisma.user as any).findFirst({
      where: {
        id: Number(id),
        roles: { has: 'DRIVER' }
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
        serviceProfiles: {
          select: {
            driverRentalServices: {
              select: {
                experienceYears: true,
                pricePerKm: true,
                operatingCities: true,
                hasServiceExperience: true,
                licenseType: true,
                bio: true,
                languages: true,
                status: true
              }
            }
          }
        }
      },
    });

    if (!driver) {
      throw new BadRequestException('Không tìm thấy tài xế hoặc tài khoản chưa được xác minh.');
    }

    const allReviews = await this.prisma.review.findMany({
      where: { targetId: Number(id) }
    });

    const ratingRecords = allReviews.filter(r => r.rating > 0);
    const totalRatings = ratingRecords.length;
    const averageRating = totalRatings > 0
      ? Number((ratingRecords.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1))
      : 0.0;

    return {
      ...driver,
      driverProfile: driver.serviceProfiles?.[0]?.driverRentalServices?.[0] || null,
      averageRating,
      totalRatings
    };
  }
}
