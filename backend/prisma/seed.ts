// EEC EAMS – Database Seed Script (Phase 2 Refinements)
// Populates Ethiopian Engineering Corporation organizational structure, staff, IT assets, and assignments.

import 'dotenv/config';
import crypto from 'crypto';
import prisma, { pool } from '../src/lib/prisma';
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

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Starting EEC EAMS database seeding (with enums & department locations)...');

  // 1. Clean existing records in dependency order
  console.log('🧹 Cleaning existing data...');
  await prisma.inspectionTest.deleteMany();
  await prisma.maintenanceTicket.deleteMany();
  await prisma.assetAssignment.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // 2. Seed 10 Real Ethiopian Engineering Corporation Departments with office locations
  console.log('🏢 Seeding 10 EEC Departments with office location, building & floor...');
  const departmentsData = [
    {
      code: 'EEC-TIS',
      name: 'Transport Infrastructure Sector',
      description: 'Designs and manages major highways, bridges, railways, and transit infrastructure.',
      location: 'Addis Ababa Head Office (Kazanchis)',
      officeLocation: 'Suite A-301',
      building: 'Block A (Engineering Wing)',
      floor: '3rd Floor',
      headOfDepartment: 'Eng. Solomon Worku',
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
      name: 'Information & Communication Technology Directorate',
      description: 'Enterprise IT infrastructure, cybersecurity, CAD/BIM workstations, and asset tracking systems.',
      location: 'Addis Ababa Head Office (Kazanchis)',
      officeLocation: 'Room B-402 (Data Center Wing)',
      building: 'Block B (Technology Wing)',
      floor: '4th Floor',
      headOfDepartment: 'Ato Tadesse Bekele',
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
    createdDepartments[dept.code] = await prisma.department.create({ data: dept });
  }

  // 3. Seed 1 System Administrator + 5 Staff Users & EmployeeProfiles
  console.log('👥 Seeding System Administrator & 5 Staff Members...');
  const usersData = [
    {
      email: 'admin@eec.gov.et',
      password: 'Admin@EEC2026!',
      role: UserRole.SUPER_ADMIN,
      profile: {
        employeeId: 'EEC-EMP-001',
        firstName: 'Tadesse',
        lastName: 'Bekele',
        phone: '+251-11-551-4001',
        jobTitle: 'Director of ICT & Infrastructure',
        departmentCode: 'EEC-ICT',
        officeLocation: 'Addis Ababa Head Office (Kazanchis), Block B, Room 402',
      },
    },
    {
      email: 'almaz.hailu@eec.gov.et',
      password: 'Employee@EEC2026!',
      role: UserRole.EMPLOYEE,
      profile: {
        employeeId: 'EEC-EMP-002',
        firstName: 'Almaz',
        lastName: 'Hailu',
        phone: '+251-11-551-4002',
        jobTitle: 'Senior Water Resources Engineer',
        departmentCode: 'EEC-WIES',
        officeLocation: 'Addis Ababa Head Office (Kazanchis), Block B, Room 210',
      },
    },
    {
      email: 'dawit.yohannes@eec.gov.et',
      password: 'Employee@EEC2026!',
      role: UserRole.EMPLOYEE,
      profile: {
        employeeId: 'EEC-EMP-003',
        firstName: 'Dawit',
        lastName: 'Yohannes',
        phone: '+251-11-551-4003',
        jobTitle: 'Principal Highway & Transport Engineer',
        departmentCode: 'EEC-TIS',
        officeLocation: 'Bole Sub-Office (Airport Road), Room 204',
      },
    },
    {
      email: 'selamawit.girma@eec.gov.et',
      password: 'Employee@EEC2026!',
      role: UserRole.MANAGER,
      profile: {
        employeeId: 'EEC-EMP-004',
        firstName: 'Selamawit',
        lastName: 'Girma',
        phone: '+251-11-551-4004',
        jobTitle: 'Lead Structural Design Engineer',
        departmentCode: 'EEC-BUDS',
        officeLocation: 'Addis Ababa Head Office (Kazanchis), Block B, Room 508',
      },
    },
    {
      email: 'ermias.assefa@eec.gov.et',
      password: 'Employee@EEC2026!',
      role: UserRole.EMPLOYEE,
      profile: {
        employeeId: 'EEC-EMP-005',
        firstName: 'Ermias',
        lastName: 'Assefa',
        phone: '+251-11-551-4005',
        jobTitle: 'Senior Network & Systems Administrator',
        departmentCode: 'EEC-ICT',
        officeLocation: 'Kality Testing & Logistics Center, Server Room 1',
      },
    },
    {
      email: 'tigist.worku@eec.gov.et',
      password: 'Employee@EEC2026!',
      role: UserRole.EMPLOYEE,
      profile: {
        employeeId: 'EEC-EMP-006',
        firstName: 'Tigist',
        lastName: 'Worku',
        phone: '+251-11-551-4006',
        jobTitle: 'Procurement & Asset Logistics Specialist',
        departmentCode: 'EEC-FPD',
        officeLocation: 'Addis Ababa Head Office (Kazanchis), Block A, Room 205',
      },
    },
  ];

  const createdProfiles: Record<string, any> = {};
  const createdUsers: Record<string, any> = {};

  for (const item of usersData) {
    const user = await prisma.user.create({
      data: {
        email: item.email,
        passwordHash: hashPassword(item.password),
        role: item.role,
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
      },
    });
    createdUsers[item.email] = user;

    const profile = await prisma.employeeProfile.create({
      data: {
        userId: user.id,
        employeeId: item.profile.employeeId,
        firstName: item.profile.firstName,
        lastName: item.profile.lastName,
        phone: item.profile.phone,
        jobTitle: item.profile.jobTitle,
        departmentId: createdDepartments[item.profile.departmentCode].id,
        officeLocation: item.profile.officeLocation,
      },
    });
    createdProfiles[item.profile.employeeId] = profile;
  }

  // 4. Seed 10 Realistic IT Assets with AssetCategory & AssetCondition
  console.log('💻 Seeding 10 IT Assets with categories and conditions...');
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
      notes: 'Assigned to Principal Highway Engineer for civil design and field surveys.',
      assignedToEmpId: 'EEC-EMP-003', // Dawit
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
      departmentCode: 'EEC-WIES',
      location: 'Head Office, Room 210',
      purchaseDate: new Date('2024-04-10'),
      purchasePrice: 1920.0,
      warrantyExpiry: new Date('2027-04-10'),
      notes: 'Configured with hydraulic modeling and GIS software suite.',
      assignedToEmpId: 'EEC-EMP-002', // Almaz
    },
    {
      assetCode: 'EEC-AST-003',
      name: 'HP EliteBook 840 G10',
      category: AssetCategory.LAPTOP,
      condition: AssetCondition.EXCELLENT,
      brand: 'HP',
      model: 'EliteBook 840 G10 Core i7 32GB',
      serialNumber: 'HP-840-7712C',
      status: AssetStatus.ASSIGNED,
      departmentCode: 'EEC-BUDS',
      location: 'Head Office, Room 508',
      purchaseDate: new Date('2024-02-20'),
      purchasePrice: 2050.0,
      warrantyExpiry: new Date('2027-02-20'),
      notes: 'BIM / Revit workstation laptop for structural engineering team.',
      assignedToEmpId: 'EEC-EMP-004', // Selamawit
    },
    {
      assetCode: 'EEC-AST-004',
      name: 'Dell OptiPlex 7010 Micro Desktop',
      category: AssetCategory.DESKTOP,
      condition: AssetCondition.GOOD,
      brand: 'Dell',
      model: 'OptiPlex 7010 Micro Core i7 16GB',
      serialNumber: 'DL-7010-6643D',
      status: AssetStatus.ASSIGNED,
      departmentCode: 'EEC-ICT',
      location: 'Kality Testing & Logistics Center',
      purchaseDate: new Date('2024-01-12'),
      purchasePrice: 1250.0,
      warrantyExpiry: new Date('2027-01-12'),
      notes: 'Dedicated systems administration desktop.',
      assignedToEmpId: 'EEC-EMP-005', // Ermias
    },
    {
      assetCode: 'EEC-AST-005',
      name: 'HP ProDesk 400 G7 Desktop',
      category: AssetCategory.DESKTOP,
      condition: AssetCondition.GOOD,
      brand: 'HP',
      model: 'ProDesk 400 G7 SFF Core i5 16GB',
      serialNumber: 'HP-400-5532E',
      status: AssetStatus.ASSIGNED,
      departmentCode: 'EEC-FPD',
      location: 'Head Office, Room 205',
      purchaseDate: new Date('2023-11-05'),
      purchasePrice: 980.0,
      warrantyExpiry: new Date('2026-11-05'),
      notes: 'Enterprise procurement and ERP management terminal.',
      assignedToEmpId: 'EEC-EMP-006', // Tigist
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
      assignedToEmpId: null,
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
      assignedToEmpId: null,
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
      assignedToEmpId: null,
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
      assignedToEmpId: null,
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
      assignedToEmpId: null,
    },
  ];

  const createdAssets: Record<string, any> = {};

  for (const item of assetsData) {
    const asset = await prisma.asset.create({
      data: {
        assetCode: item.assetCode,
        name: item.name,
        category: item.category,
        condition: item.condition,
        brand: item.brand,
        model: item.model,
        serialNumber: item.serialNumber,
        status: item.status,
        departmentId: createdDepartments[item.departmentCode].id,
        location: item.location,
        purchaseDate: item.purchaseDate,
        purchasePrice: item.purchasePrice,
        warrantyExpiry: item.warrantyExpiry,
        notes: item.notes,
      },
    });
    createdAssets[item.assetCode] = asset;

    // 5. Create AssetAssignment if assigned
    if (item.assignedToEmpId) {
      const emp = createdProfiles[item.assignedToEmpId];
      await prisma.assetAssignment.create({
        data: {
          assetId: asset.id,
          employeeId: emp.id,
          assignedDate: new Date('2024-05-15'),
          conditionOnAssign: 'Brand new in box, fully configured with EEC enterprise image.',
          isCurrent: true,
          notes: `Assigned for official EEC engineering and administrative tasks.`,
        },
      });
    }
  }

  // 6. Seed Maintenance Record & Inspection Test with MaintenancePriority enum
  console.log('🔧 Seeding Maintenance Ticket & Inspection Test...');
  const maintenanceTicket = await prisma.maintenanceTicket.create({
    data: {
      ticketNumber: 'EEC-MNT-2026-0001',
      assetId: createdAssets['EEC-AST-008'].id, // Cisco Router
      title: 'WAN Interface SFP Module Optical Transceiver Replacement',
      description: 'Periodic CRC error bursts detected on 10G uplink to Ethio Telecom ISP. Optical power levels require calibration.',
      priority: MaintenancePriority.HIGH,
      status: MaintenanceStatus.IN_PROGRESS,
      cost: 320.0,
      startDate: new Date('2026-09-15'),
      reportedBy: 'Ermias Assefa (Senior Network Admin)',
      assignedTechnician: 'Cisco Certified Specialist (Ethio Telecom Enterprise Support)',
      resolutionNotes: 'Replacement 10G-LR SFP+ module installed. Awaiting final load-testing and packet loss verification.',
    },
  });

  await prisma.inspectionTest.create({
    data: {
      ticketId: maintenanceTicket.id,
      testType: 'OPTICAL_SIGNAL_AND_PACKET_LOSS',
      status: InspectionStatus.NEEDS_REPAIR,
      testedBy: 'Ermias Assefa',
      testDate: new Date('2026-09-18'),
      findings: 'Tx optical power measured at -4.1 dBm (normal). Rx power erratic at -15.8 dBm indicating slight patch cable attenuation.',
      recommendations: 'Replace LC-LC single-mode fiber patch cord before placing back into live network.',
      passed: false,
    },
  });

  // 7. Seed Initial Audit Logs
  console.log('📜 Seeding initial Audit Logs...');
  const adminUser = createdUsers['admin@eec.gov.et'];
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'SYSTEM_INITIALIZATION',
        entity: 'System',
        entityId: 'EEC-EAMS-SYSTEM',
        details: 'Initial database architecture deployment and seed data generation for Ethiopian Engineering Corporation.',
        ipAddress: '127.0.0.1',
        userAgent: 'EEC-EAMS-CLI/2.0',
      },
      {
        userId: adminUser.id,
        action: 'DEPARTMENT_SEED',
        entity: 'Department',
        entityId: createdDepartments['EEC-ICT'].id,
        details: 'Configured 10 core organizational sectors and directorates with office locations.',
        ipAddress: '127.0.0.1',
        userAgent: 'EEC-EAMS-CLI/2.0',
      },
      {
        userId: adminUser.id,
        action: 'ASSET_CREATED',
        entity: 'Asset',
        entityId: createdAssets['EEC-AST-001'].id,
        details: 'Registered Dell Latitude 5540 under Transport Infrastructure Sector with category and condition.',
        ipAddress: '127.0.0.1',
        userAgent: 'EEC-EAMS-CLI/2.0',
      },
    ],
  });

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
