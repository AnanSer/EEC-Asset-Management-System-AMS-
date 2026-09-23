// EEC EAMS – Database Seed Script (Phase 9 QA Demo Accounts)
// Populates Ethiopian Engineering Corporation organizational structure, staff, IT assets, and assignments.
// Generates approved Better Auth & business accounts for RBAC testing.

import 'dotenv/config';
import crypto from 'crypto';
import prisma, { pool } from '../src/lib/prisma';
import { hashPassword } from 'better-auth/crypto';
import {
  UserRole,
  AccountStatus,
  AssetCategory,
  AssetStatus,
  AssetCondition,
  MaintenanceStatus,
  MaintenancePriority,
  InspectionStatus,
} from '@prisma/client';

const DEMO_PASSWORD = 'EEC@12345';

async function main() {
  console.log('🌱 Starting EEC EAMS database seeding (Phase 9 QA Demo Accounts)...');

  // 1. Seed / Upsert 10 Real Ethiopian Engineering Corporation Departments
  console.log('🏢 Seeding / Upserting 10 EEC Departments...');
  const departmentsData = [
    {
      code: 'EEC-TIS',
      name: 'Transport Infrastructure Services',
      description: 'Designs and manages major highways, bridges, railways, and transit infrastructure.',
      location: 'Addis Ababa Head Office (Kazanchis)',
      officeLocation: 'Suite A-301',
      building: 'Block A (Engineering Wing)',
      floor: '3rd Floor',
      headOfDepartment: 'Tadesse Bekele',
    },
    {
      code: 'EEC-EPS',
      name: 'Energy & Power Sector',
      description: 'Hydroelectric, geothermal, solar, and national power grid transmission engineering.',
      location: 'Addis Ababa Head Office (Kazanchis)',
      officeLocation: 'Suite A-405',
      building: 'Block A (Engineering Wing)',
      floor: '4th Floor',
      headOfDepartment: 'Dr. Getachew Mengistu',
    },
    {
      code: 'EEC-WIES',
      name: 'Water & Irrigation Engineering Sector',
      description: 'Hydraulic modeling, dam design, irrigation networks, and regional water supply schemes.',
      location: 'Addis Ababa Head Office (Kazanchis)',
      officeLocation: 'Suite B-201',
      building: 'Block B (Civil & Water Wing)',
      floor: '2nd Floor',
      headOfDepartment: 'Eng. Kidist Abebe',
    },
    {
      code: 'EEC-BUDS',
      name: 'Building & Urban Development Sector',
      description: 'Architectural, structural, and mechanical engineering for civic and commercial complexes.',
      location: 'Addis Ababa Head Office (Kazanchis)',
      officeLocation: 'Suite B-510',
      building: 'Block B (Civil & Water Wing)',
      floor: '5th Floor',
      headOfDepartment: 'Arch. Brook Tefera',
    },
    {
      code: 'EEC-SGGS',
      name: 'Surveying, Geospatial & Geotechnical Sector',
      description: 'Geodetic survey, GIS mapping, soil mechanics, and materials laboratory testing.',
      location: 'Kality Testing & Geotechnical Center',
      officeLocation: 'Lab Complex Room 102',
      building: 'Central Laboratory Wing',
      floor: 'Ground Floor',
      headOfDepartment: 'Eng. Mulugeta Desta',
    },
    {
      code: 'EEC-ESIA',
      name: 'Environmental & Social Impact Assessment Directorate',
      description: 'Environmental clearance, ecological sustainability, and socio-economic resettlement audits.',
      location: 'Addis Ababa Head Office (Kazanchis)',
      officeLocation: 'Room C-204',
      building: 'Block C (Administration Wing)',
      floor: '2nd Floor',
      headOfDepartment: 'Dr. Aster Haile',
    },
    {
      code: 'EEC-CPBD',
      name: 'Corporate Planning & Business Development Directorate',
      description: 'Strategic planning, enterprise risk analysis, project feasibility, and international partnerships.',
      location: 'Addis Ababa Head Office (Kazanchis)',
      officeLocation: 'Room C-302',
      building: 'Block C (Administration Wing)',
      floor: '3rd Floor',
      headOfDepartment: 'Ato Henok Tesfaye',
    },
    {
      code: 'EEC-ICT',
      name: 'ICT Directorate',
      description: 'Enterprise IT infrastructure, cybersecurity, CAD/BIM workstations, and asset tracking systems.',
      location: 'Addis Ababa Head Office (Kazanchis)',
      officeLocation: 'Room B-402 (Data Center Wing)',
      building: 'Block B (Technology Wing)',
      floor: '4th Floor',
      headOfDepartment: 'EEC System Administrator',
    },
    {
      code: 'EEC-FPD',
      name: 'Finance & Procurement Directorate',
      description: 'Financial accounting, corporate budgeting, supply chain management, and equipment procurement.',
      location: 'Addis Ababa Head Office (Kazanchis)',
      officeLocation: 'Room A-202',
      building: 'Block A (Engineering Wing)',
      floor: '2nd Floor',
      headOfDepartment: 'W/ro Genet Assefa',
    },
    {
      code: 'EEC-HRAD',
      name: 'Human Resource & Administration Directorate',
      description: 'Personnel administration, capacity development, fleet management, and corporate property.',
      location: 'Addis Ababa Head Office (Kazanchis)',
      officeLocation: 'Room C-101',
      building: 'Block C (Administration Wing)',
      floor: '1st Floor',
      headOfDepartment: 'Ato Yohannes Kebede',
    },
  ];

  const createdDepartments: Record<string, any> = {};
  for (const dept of departmentsData) {
    const record = await prisma.department.upsert({
      where: { code: dept.code },
      update: {
        name: dept.name,
        description: dept.description,
        location: dept.location,
        officeLocation: dept.officeLocation,
        building: dept.building,
        floor: dept.floor,
        headOfDepartment: dept.headOfDepartment,
        isActive: true,
      },
      create: dept,
    });
    createdDepartments[dept.code] = record;
  }

  // 2. Hash Password with Better Auth Crypto (scrypt algorithm)
  const hashedPassword = await hashPassword(DEMO_PASSWORD);

  // 3. Demo Accounts Definition
  console.log('👥 Seeding / Upserting 4 Demo Accounts for RBAC testing...');
  const demoAccounts = [
    {
      roleName: 'ADMIN',
      email: 'admin@eec.gov.et',
      name: 'EEC System Administrator',
      firstName: 'EEC System',
      lastName: 'Administrator',
      employeeId: 'EEC-ADM-001',
      departmentCode: 'EEC-ICT',
      role: UserRole.ADMIN,
      jobTitle: 'EEC System Administrator',
      phone: '+251-11-551-4001',
      officeLocation: 'Addis Ababa Head Office (Kazanchis), Block B, Room 402',
    },
    {
      roleName: 'IT_TECHNICIAN',
      email: 'technician@eec.gov.et',
      name: 'Tigist Worku',
      firstName: 'Tigist',
      lastName: 'Worku',
      employeeId: 'EEC-ICT-001',
      departmentCode: 'EEC-ICT',
      role: UserRole.IT_TECHNICIAN,
      jobTitle: 'Senior IT Support Technician',
      phone: '+251-11-551-4005',
      officeLocation: 'Addis Ababa Head Office (Kazanchis), Block B, Tech Lab 1',
    },
    {
      roleName: 'DEPARTMENT_MANAGER',
      email: 'manager.transport@eec.gov.et',
      name: 'Tadesse Bekele',
      firstName: 'Tadesse',
      lastName: 'Bekele',
      employeeId: 'EEC-TIS-001',
      departmentCode: 'EEC-TIS',
      role: UserRole.DEPARTMENT_MANAGER,
      jobTitle: 'Department Director & Chief Engineer',
      phone: '+251-11-551-4003',
      officeLocation: 'Addis Ababa Head Office (Kazanchis), Block A, Suite 301',
    },
    {
      roleName: 'EMPLOYEE',
      email: 'employee.transport@eec.gov.et',
      name: 'Meron Alemu',
      firstName: 'Meron',
      lastName: 'Alemu',
      employeeId: 'EEC-TIS-002',
      departmentCode: 'EEC-TIS',
      role: UserRole.EMPLOYEE,
      jobTitle: 'Transport Systems & Civil Engineer',
      phone: '+251-11-551-4004',
      officeLocation: 'Addis Ababa Head Office (Kazanchis), Block A, Suite 304',
    },
  ];

  const seededEmployees: Record<string, any> = {};

  for (const acc of demoAccounts) {
    const dept = createdDepartments[acc.departmentCode];
    if (!dept) {
      throw new Error(`Department ${acc.departmentCode} not found for account ${acc.email}`);
    }

    // A. Ensure or update business User
    let user = await prisma.user.findUnique({
      where: { email: acc.email },
      include: { employeeProfile: true },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: acc.role,
          status: AccountStatus.APPROVED,
          isEmailVerified: true,
          passwordHash: hashedPassword,
        },
        include: { employeeProfile: true },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: acc.email,
          passwordHash: hashedPassword,
          role: acc.role,
          status: AccountStatus.APPROVED,
          isEmailVerified: true,
        },
        include: { employeeProfile: true },
      });
    }

    // B. Handle Employee ID uniqueness safety
    const existingProfileWithEmpId = await prisma.employeeProfile.findUnique({
      where: { employeeId: acc.employeeId },
    });

    if (existingProfileWithEmpId && existingProfileWithEmpId.userId !== user.id) {
      await prisma.employeeProfile.update({
        where: { id: existingProfileWithEmpId.id },
        data: { employeeId: `${existingProfileWithEmpId.employeeId}-RENAMED-${Date.now()}` },
      });
    }

    // C. Upsert EmployeeProfile
    let profile = user.employeeProfile;
    if (profile) {
      profile = await prisma.employeeProfile.update({
        where: { id: profile.id },
        data: {
          employeeId: acc.employeeId,
          firstName: acc.firstName,
          lastName: acc.lastName,
          phone: acc.phone,
          jobTitle: acc.jobTitle,
          departmentId: dept.id,
          officeLocation: acc.officeLocation,
          isActive: true,
        },
      });
    } else {
      profile = await prisma.employeeProfile.create({
        data: {
          userId: user.id,
          employeeId: acc.employeeId,
          firstName: acc.firstName,
          lastName: acc.lastName,
          phone: acc.phone,
          jobTitle: acc.jobTitle,
          departmentId: dept.id,
          officeLocation: acc.officeLocation,
          isActive: true,
        },
      });
    }
    seededEmployees[acc.email] = profile;

    // D. Upsert Better Auth AuthUser record (Linked by id/email)
    let authUser = await prisma.authUser.findUnique({
      where: { email: acc.email },
    });

    if (authUser) {
      authUser = await prisma.authUser.update({
        where: { id: authUser.id },
        data: {
          name: acc.name,
          emailVerified: true,
        },
      });
    } else {
      authUser = await prisma.authUser.create({
        data: {
          id: user.id,
          name: acc.name,
          email: acc.email,
          emailVerified: true,
        },
      });
    }

    // E. Upsert Better Auth AuthAccount record with scrypt hashed password
    const existingAccount = await prisma.authAccount.findFirst({
      where: {
        userId: authUser.id,
        providerId: 'credential',
      },
    });

    if (existingAccount) {
      await prisma.authAccount.update({
        where: { id: existingAccount.id },
        data: {
          password: hashedPassword,
          accountId: authUser.id,
        },
      });
    } else {
      await prisma.authAccount.create({
        data: {
          id: crypto.randomUUID(),
          accountId: authUser.id,
          providerId: 'credential',
          userId: authUser.id,
          password: hashedPassword,
        },
      });
    }
  }

  // 4. Seed / Upsert 10 Realistic IT Assets
  console.log('💻 Seeding / Upserting IT Assets...');
  const assetsData = [
    {
      assetCode: 'EEC-AST-001',
      name: 'Dell Latitude 5540 Laptop',
      category: AssetCategory.LAPTOP,
      condition: AssetCondition.EXCELLENT,
      brand: 'Dell',
      model: 'Latitude 5540 Core i7 16GB 512GB SSD',
      serialNumber: 'DL-5540-8831A',
      status: AssetStatus.ASSIGNED,
      departmentCode: 'EEC-TIS',
      location: 'Bole Sub-Office, Room 204',
      purchaseDate: new Date('2024-03-15'),
      purchasePrice: 1850.0,
      warrantyExpiry: new Date('2027-03-15'),
      notes: 'Assigned to Transport Systems & Civil Engineer for field surveys.',
    },
    {
      assetCode: 'EEC-AST-002',
      name: 'Lenovo ThinkPad T14 Gen 4',
      category: AssetCategory.LAPTOP,
      condition: AssetCondition.GOOD,
      brand: 'Lenovo',
      model: 'ThinkPad T14 AMD Ryzen 7 PRO 32GB',
      serialNumber: 'TP-T14-9924B',
      status: AssetStatus.ASSIGNED,
      departmentCode: 'EEC-TIS',
      location: 'Head Office, Suite A-301',
      purchaseDate: new Date('2024-04-10'),
      purchasePrice: 1920.0,
      warrantyExpiry: new Date('2027-04-10'),
      notes: 'Assigned to Transport Infrastructure Services Department Manager.',
    },
    {
      assetCode: 'EEC-AST-003',
      name: 'HP EliteBook 840 G10',
      category: AssetCategory.LAPTOP,
      condition: AssetCondition.EXCELLENT,
      brand: 'HP',
      model: 'EliteBook 840 G10 Core i7 32GB',
      serialNumber: 'HP-840-7712C',
      status: AssetStatus.AVAILABLE,
      departmentCode: 'EEC-BUDS',
      location: 'Head Office, Room 508',
      purchaseDate: new Date('2024-02-20'),
      purchasePrice: 2050.0,
      warrantyExpiry: new Date('2027-02-20'),
      notes: 'BIM / Revit workstation laptop for structural engineering team.',
    },
    {
      assetCode: 'EEC-AST-004',
      name: 'Dell OptiPlex 7010 Micro Desktop',
      category: AssetCategory.DESKTOP,
      condition: AssetCondition.GOOD,
      brand: 'Dell',
      model: 'OptiPlex 7010 Micro Core i7 16GB',
      serialNumber: 'DL-7010-6643D',
      status: AssetStatus.AVAILABLE,
      departmentCode: 'EEC-ICT',
      location: 'Kality Testing & Logistics Center',
      purchaseDate: new Date('2024-01-12'),
      purchasePrice: 1250.0,
      warrantyExpiry: new Date('2027-01-12'),
      notes: 'Dedicated systems administration desktop.',
    },
    {
      assetCode: 'EEC-AST-005',
      name: 'HP ProDesk 400 G7 Desktop',
      category: AssetCategory.DESKTOP,
      condition: AssetCondition.GOOD,
      brand: 'HP',
      model: 'ProDesk 400 G7 SFF Core i5 16GB',
      serialNumber: 'HP-400-5532E',
      status: AssetStatus.AVAILABLE,
      departmentCode: 'EEC-FPD',
      location: 'Head Office, Room 205',
      purchaseDate: new Date('2023-11-05'),
      purchasePrice: 980.0,
      warrantyExpiry: new Date('2026-11-05'),
      notes: 'Enterprise procurement and ERP management terminal.',
    },
    {
      assetCode: 'EEC-AST-006',
      name: 'HP LaserJet Enterprise M608dn',
      category: AssetCategory.PRINTER,
      condition: AssetCondition.FAIR,
      brand: 'HP',
      model: 'LaserJet Enterprise M608dn Monochrome',
      serialNumber: 'HP-M608-4421F',
      status: AssetStatus.AVAILABLE,
      departmentCode: 'EEC-HRAD',
      location: 'Head Office, 1st Floor Shared Copy Center',
      purchaseDate: new Date('2023-09-18'),
      purchasePrice: 1450.0,
      warrantyExpiry: new Date('2026-09-18'),
      notes: 'Heavy-duty duplex network laser printer for corporate documentation.',
    },
    {
      assetCode: 'EEC-AST-007',
      name: 'Fujitsu fi-7160 High-Speed Scanner',
      category: AssetCategory.SCANNER,
      condition: AssetCondition.GOOD,
      brand: 'Fujitsu',
      model: 'fi-7160 Duplex Document Scanner 60ppm',
      serialNumber: 'FJ-7160-3310G',
      status: AssetStatus.AVAILABLE,
      departmentCode: 'EEC-CPBD',
      location: 'Head Office Central Archive & Records Center',
      purchaseDate: new Date('2024-05-02'),
      purchasePrice: 1100.0,
      warrantyExpiry: new Date('2027-05-02'),
      notes: 'High-speed archival scanning for government tenders and contract files.',
    },
    {
      assetCode: 'EEC-AST-008',
      name: 'Cisco Catalyst 8300 Edge Router',
      category: AssetCategory.ROUTER,
      condition: AssetCondition.NEEDS_REPAIR,
      brand: 'Cisco',
      model: 'C8300-1N1S-4T2X Modular Enterprise Gateway',
      serialNumber: 'CS-8300-2209H',
      status: AssetStatus.MAINTENANCE,
      departmentCode: 'EEC-ICT',
      location: 'Main Data Center, Rack B-04',
      purchaseDate: new Date('2023-06-14'),
      purchasePrice: 4800.0,
      warrantyExpiry: new Date('2028-06-14'),
      notes: 'Core WAN edge router. Undergoing transceiver maintenance.',
    },
    {
      assetCode: 'EEC-AST-009',
      name: 'Cisco Catalyst 2960-X Gigabit Switch',
      category: AssetCategory.SWITCH,
      condition: AssetCondition.EXCELLENT,
      brand: 'Cisco',
      model: 'WS-C2960X-48FPS-L 48-Port PoE+ Switch',
      serialNumber: 'CS-2960-1198J',
      status: AssetStatus.AVAILABLE,
      departmentCode: 'EEC-SGGS',
      location: 'Kality Testing Lab, Network Distribution Cabinet',
      purchaseDate: new Date('2023-08-20'),
      purchasePrice: 2200.0,
      warrantyExpiry: new Date('2026-08-20'),
      notes: 'Available for immediate replacement or new lab network expansion.',
    },
    {
      assetCode: 'EEC-AST-010',
      name: 'Epson EB-2250U Full HD Projector',
      category: AssetCategory.PROJECTOR,
      condition: AssetCondition.GOOD,
      brand: 'Epson',
      model: 'EB-2250U 5000 Lumens WUXGA 1080p',
      serialNumber: 'EP-2250-0087K',
      status: AssetStatus.AVAILABLE,
      departmentCode: 'EEC-ESIA',
      location: 'Head Office, 6th Floor Main Auditorium & Boardroom',
      purchaseDate: new Date('2024-02-14'),
      purchasePrice: 1650.0,
      warrantyExpiry: new Date('2027-02-14'),
      notes: 'Shared high-lumen conference projector for stakeholder presentations.',
    },
  ];

  const createdAssets: Record<string, any> = {};
  for (const item of assetsData) {
    const deptId = createdDepartments[item.departmentCode]?.id || null;
    const asset = await prisma.asset.upsert({
      where: { assetCode: item.assetCode },
      update: {
        name: item.name,
        category: item.category,
        condition: item.condition,
        brand: item.brand,
        model: item.model,
        serialNumber: item.serialNumber,
        departmentId: deptId,
        location: item.location,
        purchaseDate: item.purchaseDate,
        purchasePrice: item.purchasePrice,
        warrantyExpiry: item.warrantyExpiry,
        notes: item.notes,
      },
      create: {
        assetCode: item.assetCode,
        name: item.name,
        category: item.category,
        condition: item.condition,
        brand: item.brand,
        model: item.model,
        serialNumber: item.serialNumber,
        status: item.status,
        departmentId: deptId,
        location: item.location,
        purchaseDate: item.purchaseDate,
        purchasePrice: item.purchasePrice,
        warrantyExpiry: item.warrantyExpiry,
        notes: item.notes,
      },
    });
    createdAssets[item.assetCode] = asset;
  }

  // 5. Asset Assignments
  console.log('📦 Configuring Asset Assignments for RBAC testing...');

  // A. Assign Laptop to Employee (Meron Alemu - employee.transport@eec.gov.et)
  const employeeProfile = seededEmployees['employee.transport@eec.gov.et'];
  const employeeLaptop = createdAssets['EEC-AST-001']; // Dell Latitude 5540
  if (employeeLaptop && employeeProfile) {
    await prisma.asset.update({
      where: { id: employeeLaptop.id },
      data: {
        status: AssetStatus.ASSIGNED,
        departmentId: createdDepartments['EEC-TIS'].id,
      },
    });

    await prisma.assetAssignment.updateMany({
      where: {
        OR: [
          { assetId: employeeLaptop.id, isCurrent: true },
          { employeeId: employeeProfile.id, isCurrent: true },
        ],
      },
      data: {
        isCurrent: false,
        returnedDate: new Date(),
      },
    });

    await prisma.assetAssignment.create({
      data: {
        assetId: employeeLaptop.id,
        employeeId: employeeProfile.id,
        assignedDate: new Date('2024-05-15'),
        conditionOnAssign: 'Excellent condition, pre-configured with engineering suite.',
        isCurrent: true,
        notes: 'Assigned to Transport Systems & Civil Engineer (Employee RBAC Testing).',
      },
    });
  }

  // B. Assign Laptop to Department Manager (Tadesse Bekele - manager.transport@eec.gov.et)
  const managerProfile = seededEmployees['manager.transport@eec.gov.et'];
  const managerLaptop = createdAssets['EEC-AST-002']; // Lenovo ThinkPad T14
  if (managerLaptop && managerProfile) {
    await prisma.asset.update({
      where: { id: managerLaptop.id },
      data: {
        status: AssetStatus.ASSIGNED,
        departmentId: createdDepartments['EEC-TIS'].id,
      },
    });

    await prisma.assetAssignment.updateMany({
      where: {
        OR: [
          { assetId: managerLaptop.id, isCurrent: true },
          { employeeId: managerProfile.id, isCurrent: true },
        ],
      },
      data: {
        isCurrent: false,
        returnedDate: new Date(),
      },
    });

    await prisma.assetAssignment.create({
      data: {
        assetId: managerLaptop.id,
        employeeId: managerProfile.id,
        assignedDate: new Date('2024-04-10'),
        conditionOnAssign: 'Good condition, enterprise manager configuration.',
        isCurrent: true,
        notes: 'Assigned to Transport Infrastructure Services Department Manager.',
      },
    });
  }

  // C. Ensure IT Technician has NO assigned assets
  const technicianProfile = seededEmployees['technician@eec.gov.et'];
  if (technicianProfile) {
    await prisma.assetAssignment.updateMany({
      where: {
        employeeId: technicianProfile.id,
        isCurrent: true,
      },
      data: {
        isCurrent: false,
        returnedDate: new Date(),
      },
    });
  }

  // D. Ensure Admin has NO assigned assets
  const adminProfile = seededEmployees['admin@eec.gov.et'];
  if (adminProfile) {
    await prisma.assetAssignment.updateMany({
      where: {
        employeeId: adminProfile.id,
        isCurrent: true,
      },
      data: {
        isCurrent: false,
        returnedDate: new Date(),
      },
    });
  }

  // 6. Maintenance Ticket (if not exists)
  const routerAsset = createdAssets['EEC-AST-008'];
  if (routerAsset) {
    const existingTicket = await prisma.maintenanceTicket.findUnique({
      where: { ticketNumber: 'EEC-MNT-2026-0001' },
    });
    if (!existingTicket) {
      const maintenanceTicket = await prisma.maintenanceTicket.create({
        data: {
          ticketNumber: 'EEC-MNT-2026-0001',
          assetId: routerAsset.id,
          title: 'WAN Interface SFP Module Optical Transceiver Replacement',
          description: 'Periodic CRC error bursts detected on 10G uplink to Ethio Telecom ISP. Optical power levels require calibration.',
          priority: MaintenancePriority.HIGH,
          status: MaintenanceStatus.IN_PROGRESS,
          cost: 320.0,
          startDate: new Date('2026-09-15'),
          reportedBy: 'Tigist Worku (Senior IT Technician)',
          assignedTechnician: 'Ethio Telecom Enterprise Support Specialist',
          resolutionNotes: 'Replacement 10G-LR SFP+ module installed. Awaiting final load-testing and packet loss verification.',
        },
      });

      await prisma.inspectionTest.create({
        data: {
          ticketId: maintenanceTicket.id,
          testType: 'OPTICAL_SIGNAL_AND_PACKET_LOSS',
          status: InspectionStatus.NEEDS_REPAIR,
          testedBy: 'Tigist Worku',
          testDate: new Date('2026-09-18'),
          findings: 'Tx optical power measured at -4.1 dBm (normal). Rx erratic at -15.8 dBm.',
          recommendations: 'Replace LC-LC single-mode fiber patch cord before placing back into live network.',
          passed: false,
        },
      });
    }
  }

  // 7. Initial Audit Log (if not exists)
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@eec.gov.et' } });
  if (adminUser) {
    const existingLog = await prisma.auditLog.findFirst({
      where: { action: 'DEMO_ACCOUNTS_SEEDED' },
    });
    if (!existingLog) {
      await prisma.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'DEMO_ACCOUNTS_SEEDED',
          entity: 'System',
          entityId: 'EEC-EAMS-AUTH',
          details: 'Seeded 4 approved demo accounts for RBAC testing across ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER, and EMPLOYEE.',
          ipAddress: '127.0.0.1',
          userAgent: 'EEC-EAMS-CLI/2.0',
        },
      });
    }
  }

  console.log('\n================================================================================================================');
  console.log('                            ETHIOPIAN ENGINEERING CORPORATION (EEC)');
  console.log('                          ENTERPRISE ASSET MANAGEMENT SYSTEM (EAMS)');
  console.log('                               DEMO LOGIN CREDENTIALS TABLE');
  console.log('================================================================================================================');
  console.table([
    {
      'Role': 'ADMIN',
      'Name': 'EEC System Administrator',
      'Email': 'admin@eec.gov.et',
      'Password': DEMO_PASSWORD,
      'Employee ID': 'EEC-ADM-001',
      'Department': 'ICT Directorate',
      'Status': 'APPROVED',
      'Email Verified': true,
      'Active': true,
      'Assigned Asset': 'None',
    },
    {
      'Role': 'IT_TECHNICIAN',
      'Name': 'Tigist Worku',
      'Email': 'technician@eec.gov.et',
      'Password': DEMO_PASSWORD,
      'Employee ID': 'EEC-ICT-001',
      'Department': 'ICT Directorate',
      'Status': 'APPROVED',
      'Email Verified': true,
      'Active': true,
      'Assigned Asset': 'None',
    },
    {
      'Role': 'DEPARTMENT_MANAGER',
      'Name': 'Tadesse Bekele',
      'Email': 'manager.transport@eec.gov.et',
      'Password': DEMO_PASSWORD,
      'Employee ID': 'EEC-TIS-001',
      'Department': 'Transport Infrastructure Services',
      'Status': 'APPROVED',
      'Email Verified': true,
      'Active': true,
      'Assigned Asset': 'Lenovo ThinkPad T14 Gen 4 (EEC-AST-002)',
    },
    {
      'Role': 'EMPLOYEE',
      'Name': 'Meron Alemu',
      'Email': 'employee.transport@eec.gov.et',
      'Password': DEMO_PASSWORD,
      'Employee ID': 'EEC-TIS-002',
      'Department': 'Transport Infrastructure Services',
      'Status': 'APPROVED',
      'Email Verified': true,
      'Active': true,
      'Assigned Asset': 'Dell Latitude 5540 Laptop (EEC-AST-001)',
    },
  ]);
  console.log('================================================================================================================\n');
  console.log('✅ EEC EAMS database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
