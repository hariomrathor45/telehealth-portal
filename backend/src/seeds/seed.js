require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const DoctorVerification = require('../models/DoctorVerification');
const Specialization = require('../models/Specialization');
const DoctorAvailability = require('../models/DoctorAvailability');
const Appointment = require('../models/Appointment');
const HealthConcern = require('../models/HealthConcern');
const PriorityAssessment = require('../models/PriorityAssessment');
const Consultation = require('../models/Consultation');
const MedicalRecord = require('../models/MedicalRecord');
const Notification = require('../models/Notification');
const AdminAuditLog = require('../models/AdminAuditLog');

const SPECIALIZATIONS = [
  { name: 'General Medicine', description: 'Primary care, fever, common infections, and routine medical consultations' },
  { name: 'Cardiology', description: 'Heart, blood vessels, hypertension, chest discomfort, and cardiovascular health' },
  { name: 'Dermatology', description: 'Skin conditions, rashes, allergies, hair, and nail health' },
  { name: 'Orthopedics', description: 'Bones, joints, spine, sports injuries, and musculoskeletal disorders' },
  { name: 'Pediatrics', description: 'Infant, child, and adolescent healthcare and developmental tracking' },
  { name: 'Neurology', description: 'Brain, nervous system, chronic headaches, tremors, and stroke recovery' },
  { name: 'Psychiatry', description: 'Mental wellness, anxiety, depression, sleep disorders, and behavioral health' },
  { name: 'Ophthalmology', description: 'Vision care, eye infections, and optical health' },
  { name: 'ENT (Otolaryngology)', description: 'Ear infections, sinusitis, throat pain, and nasal allergies' },
  { name: 'Gynecology & Obstetrics', description: 'Women health, reproductive care, and pregnancy wellness' },
  { name: 'Pulmonology', description: 'Lungs, respiratory health, asthma, and chronic cough' },
  { name: 'Gastroenterology', description: 'Digestive tract, stomach pain, acidity, liver, and bowel health' },
  { name: 'Endocrinology', description: 'Diabetes, thyroid disorders, and metabolic health' },
  { name: 'Oncology', description: 'Cancer diagnosis, oncology consultations, and second opinions' },
  { name: 'Urology', description: 'Urinary tract, kidney health, and male reproductive care' }
];

async function seedDatabase() {
  try {
    console.log('🌱 Connecting to MongoDB for seeding...');
    await connectDB();

    console.log('🧹 Clearing previous collection data...');
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      DoctorVerification.deleteMany({}),
      Specialization.deleteMany({}),
      DoctorAvailability.deleteMany({}),
      Appointment.deleteMany({}),
      HealthConcern.deleteMany({}),
      PriorityAssessment.deleteMany({}),
      Consultation.deleteMany({}),
      MedicalRecord.deleteMany({}),
      Notification.deleteMany({}),
      AdminAuditLog.deleteMany({}),
    ]);

    // 1. Seed Specializations
    console.log('📦 Seeding Specializations...');
    await Specialization.insertMany(SPECIALIZATIONS);
    console.log(`   ✅ ${SPECIALIZATIONS.length} specializations created`);

    // 2. Seed Default Admin User
    console.log('👑 Seeding Admin Account...');
    const adminUser = new User({
      email: 'admin@telehealth.com',
      passwordHash: 'Admin@12345',
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    await adminUser.save();
    console.log('   ✅ Admin: admin@telehealth.com / Admin@12345');

    // 3. Seed Sample Patient
    console.log('👤 Seeding Demo Patient...');
    const patientUser = new User({
      email: 'patient@telehealth.com',
      passwordHash: 'Patient@12345',
      role: 'PATIENT',
      status: 'ACTIVE',
    });
    await patientUser.save();

    const patientProfile = new Patient({
      userId: patientUser._id,
      fullName: 'Rahul Sharma',
      phone: '+91 9876543210',
      dateOfBirth: new Date('1996-05-15'),
      gender: 'Male',
      address: 'A-402 Green Meadows, Indiranagar, Bengaluru',
      emergencyContact: 'Pooja Sharma (+91 9876543211)',
    });
    await patientProfile.save();
    console.log('   ✅ Patient: patient@telehealth.com / Patient@12345');

    // 4. Seed 3 Approved Active Doctors
    console.log('🩺 Seeding Approved Doctors...');

    // Doctor 1: Cardiology
    const doc1User = new User({
      email: 'dr.priya@telehealth.com',
      passwordHash: 'Doctor@12345',
      role: 'DOCTOR',
      status: 'ACTIVE',
    });
    await doc1User.save();

    const doc1 = new Doctor({
      userId: doc1User._id,
      fullName: 'Dr. Priya Sharma',
      phone: '+91 9845012345',
      medicalRegistrationNumber: 'MCI-KA-2012-7890',
      qualification: 'MBBS, MD (Cardiology), DM',
      specialization: 'Cardiology',
      experienceYears: 12,
      hospitalClinic: 'Apollo Hospital & Heart Center',
      consultationFee: 750,
      bio: 'Senior Interventional Cardiologist with over 12 years of experience specializing in preventive cardiology, hypertension, and coronary care.',
      verificationStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      approvedAt: new Date(),
    });
    await doc1.save();

    // Doctor 2: General Medicine
    const doc2User = new User({
      email: 'dr.rajesh@telehealth.com',
      passwordHash: 'Doctor@12345',
      role: 'DOCTOR',
      status: 'ACTIVE',
    });
    await doc2User.save();

    const doc2 = new Doctor({
      userId: doc2User._id,
      fullName: 'Dr. Rajesh Verma',
      phone: '+91 9845012346',
      medicalRegistrationNumber: 'MCI-DL-2015-4321',
      qualification: 'MBBS, MD (Internal Medicine)',
      specialization: 'General Medicine',
      experienceYears: 9,
      hospitalClinic: 'Max Super Specialty Hospital',
      consultationFee: 500,
      bio: 'Consultant Physician focusing on lifestyle disorders, infectious diseases, preventive health checks, and chronic care management.',
      verificationStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      approvedAt: new Date(),
    });
    await doc2.save();

    // Doctor 3: Pediatrics
    const doc3User = new User({
      email: 'dr.ananya@telehealth.com',
      passwordHash: 'Doctor@12345',
      role: 'DOCTOR',
      status: 'ACTIVE',
    });
    await doc3User.save();

    const doc3 = new Doctor({
      userId: doc3User._id,
      fullName: 'Dr. Ananya Iyer',
      phone: '+91 9845012347',
      medicalRegistrationNumber: 'MCI-TN-2018-9988',
      qualification: 'MBBS, DCH, DNB (Pediatrics)',
      specialization: 'Pediatrics',
      experienceYears: 7,
      hospitalClinic: 'Rainbow Children Hospital',
      consultationFee: 600,
      bio: 'Dedicated Pediatrician with extensive expertise in child growth milestones, immunization, pediatric allergies, and child nutrition.',
      verificationStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      approvedAt: new Date(),
    });
    await doc3.save();

    // 5. Seed 1 PENDING Doctor for Admin Verification Testing
    console.log('⏳ Seeding Pending Doctor for Verification testing...');
    const doc4User = new User({
      email: 'dr.vikram@telehealth.com',
      passwordHash: 'Doctor@12345',
      role: 'DOCTOR',
      status: 'ACTIVE',
    });
    await doc4User.save();

    const doc4 = new Doctor({
      userId: doc4User._id,
      fullName: 'Dr. Vikram Rao',
      phone: '+91 9845012348',
      medicalRegistrationNumber: 'MCI-MH-2020-5544',
      qualification: 'MBBS, MS (Orthopedics)',
      specialization: 'Orthopedics',
      experienceYears: 5,
      hospitalClinic: 'Fortis Healthcare',
      consultationFee: 700,
      bio: 'Orthopedic surgeon specializing in joint replacement, sports injury rehabilitation, and arthroscopy.',
      verificationStatus: 'PENDING',
      accountStatus: 'ACTIVE',
    });
    await doc4.save();

    const doc4Verification = new DoctorVerification({
      doctorId: doc4._id,
      submittedDocuments: [
        {
          documentType: 'medical_license',
          storageKey: 'uploads/demo-license.pdf',
          originalName: 'MCI_License_Vikram_Rao.pdf',
          mimeType: 'application/pdf',
          documentStatus: 'PENDING',
        },
        {
          documentType: 'degree_certificate',
          storageKey: 'uploads/demo-degree.pdf',
          originalName: 'MS_Ortho_Degree_Certificate.pdf',
          mimeType: 'application/pdf',
          documentStatus: 'PENDING',
        },
        {
          documentType: 'identity_document',
          storageKey: 'uploads/demo-id.jpg',
          originalName: 'Aadhaar_National_ID.jpg',
          mimeType: 'image/jpeg',
          documentStatus: 'PENDING',
        }
      ],
      overallStatus: 'PENDING',
      remarks: 'Documents submitted on registration. Awaiting administrative review.',
    });
    await doc4Verification.save();

    // 6. Seed Sample Availability for Approved Doctors
    const days = [1, 2, 3, 4, 5]; // Mon - Fri
    for (const doc of [doc1, doc2, doc3]) {
      const availDocs = days.map(d => ({
        doctorId: doc._id,
        dayOfWeek: d,
        startTime: '09:00',
        endTime: '17:00',
        breaks: [{ startTime: '13:00', endTime: '14:00' }],
        isAvailable: true,
      }));
      await DoctorAvailability.insertMany(availDocs);
    }
    console.log('   ✅ Doctor schedules configured (Mon-Fri 09:00 - 17:00)');

    // 7. Seed Initial Demo Appointment & Priority Queue Item
    console.log('📋 Seeding Demo Priority Consultation...');
    const demoConcern = new HealthConcern({
      patientId: patientProfile._id,
      mainConcern: 'Persistent chest discomfort with mild shortness of breath during exertion',
      symptoms: ['chest pain', 'shortness of breath', 'fatigue'],
      duration: '1-3 days',
      severity: 'moderate',
      optionalInformation: 'Experienced mild palpitations yesterday evening while climbing stairs.',
    });
    await demoConcern.save();

    const demoAssessment = new PriorityAssessment({
      healthConcernId: demoConcern._id,
      patientId: patientProfile._id,
      priorityScore: 72,
      priorityLevel: 'HIGH',
      assessmentMethod: 'RULE_BASED',
      modelVersion: 'rule-engine-v1.2',
      factorsSummary: {
        severityScore: 25,
        durationScore: 12,
        symptomCountScore: 9,
        riskIndicatorScore: 26,
        flaggedHighRisk: ['chest pain', 'shortness of breath'],
      },
    });
    await demoAssessment.save();

    const todayAppointmentDate = new Date();
    todayAppointmentDate.setHours(0, 0, 0, 0);

    const demoAppointment = new Appointment({
      patientId: patientProfile._id,
      doctorId: doc1._id,
      healthConcernId: demoConcern._id,
      priorityAssessmentId: demoAssessment._id,
      appointmentDate: todayAppointmentDate,
      startTime: '10:30',
      priorityLevel: 'HIGH',
      priorityScore: 72,
      status: 'WAITING',
      queueEnteredAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
      notes: 'Patient requested priority evaluation for cardiovascular symptoms.',
    });
    await demoAppointment.save();

    console.log('\n======================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Credentials for Testing:');
    console.log('  👑 Admin:   admin@telehealth.com   / Admin@12345');
    console.log('  🩺 Doctor:  dr.priya@telehealth.com / Doctor@12345 (Approved)');
    console.log('  🩺 Doctor:  dr.vikram@telehealth.com/ Doctor@12345 (Pending Verification)');
    console.log('  👤 Patient: patient@telehealth.com / Patient@12345');
    console.log('======================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    await disconnectDB();
    process.exit(1);
  }
}

seedDatabase();
