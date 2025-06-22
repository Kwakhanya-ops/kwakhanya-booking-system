import { pgTable, serial, text, integer, timestamp, decimal, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name').notNull(),
  phoneNumber: text('phone_number'),
  address: text('address'),
  role: text('role').notNull().default('student'), // student, school, admin
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Driving schools table
export const drivingSchools = pgTable('driving_schools', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  schoolName: text('school_name').notNull(),
  description: text('description'),
  location: text('location').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone').notNull(),
  photoUrl: text('photo_url'),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Services offered by schools
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => drivingSchools.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: integer('duration').notNull(), // in minutes
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bookings table
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  schoolId: integer('school_id').references(() => drivingSchools.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  bookingDate: timestamp('booking_date').notNull(),
  status: text('status').notNull().default('pending'), // pending, confirmed, completed, cancelled
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text('payment_status').notNull().default('pending'), // pending, paid, failed
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  drivingSchools: many(drivingSchools),
  bookings: many(bookings),
}));

export const drivingSchoolsRelations = relations(drivingSchools, ({ one, many }) => ({
  user: one(users, { fields: [drivingSchools.userId], references: [users.id] }),
  services: many(services),
  bookings: many(bookings),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  school: one(drivingSchools, { fields: [services.schoolId], references: [drivingSchools.id] }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  school: one(drivingSchools, { fields: [bookings.schoolId], references: [drivingSchools.id] }),
  service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
}));

// Zod schemas
export const usersInsertSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
  fullName: (schema) => schema.min(2, "Full name must be at least 2 characters"),
  role: (schema) => schema.refine(val => ['student', 'school', 'admin'].includes(val), {
    message: "Role must be student, school, or admin"
  })
});
export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string | null;
  address: string | null;
  role: string;
  createdAt: Date;
};

export type InsertUser = z.infer<typeof usersInsertSchema>;

export const drivingSchoolsInsertSchema = createInsertSchema(drivingSchools, {
  schoolName: (schema) => schema.min(3, "School name must be at least 3 characters"),
  location: (schema) => schema.min(3, "Location must be at least 3 characters"),
  contactEmail: (schema) => schema.email("Must provide a valid email"),
  contactPhone: (schema) => schema.min(10, "Phone number must be at least 10 digits")
});

export type DrivingSchool = {
  id: number;
  userId: number;
  schoolName: string;
  description: string | null;
  location: string;
  contactEmail: string;
  contactPhone: string;
  photoUrl: string | null;
  verified: boolean | null;
  createdAt: Date;
};

export type InsertDrivingSchool = z.infer<typeof drivingSchoolsInsertSchema>;

export const servicesInsertSchema = createInsertSchema(services, {
  name: (schema) => schema.min(3, "Service name must be at least 3 characters"),
  price: (schema) => schema.min(1, "Price must be greater than 0"),
  duration: (schema) => schema.min(30, "Duration must be at least 30 minutes")
});

export type Service = {
  id: number;
  schoolId: number;
  name: string;
  description: string | null;
  price: string;
  duration: number;
  createdAt: Date;
};

export type InsertService = z.infer<typeof servicesInsertSchema>;

export const bookingsInsertSchema = createInsertSchema(bookings, {
  totalAmount: (schema) => schema.min(1, "Total amount must be greater than 0"),
  status: (schema) => schema.refine(val => ['pending', 'confirmed', 'completed', 'cancelled'].includes(val), {
    message: "Status must be pending, confirmed, completed, or cancelled"
  }),
  paymentStatus: (schema) => schema.refine(val => ['pending', 'paid', 'failed'].includes(val), {
    message: "Payment status must be pending, paid, or failed"
  })
});

export type Booking = {
  id: number;
  userId: number;
  schoolId: number;
  serviceId: number;
  bookingDate: Date;
  status: string;
  totalAmount: string;
  paymentStatus: string;
  notes: string | null;
  createdAt: Date;
};

export type InsertBooking = z.infer<typeof bookingsInsertSchema>;

// Instructors table
export const instructors = pgTable('instructors', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => drivingSchools.id).notNull(),
  name: text('name').notNull(),
  licenseNumber: text('license_number').notNull(),
  licenseExpiry: timestamp('license_expiry').notNull(),
  idNumber: text('id_number').notNull(),
  photoUrl: text('photo_url'),
  licensePhotoUrl: text('license_photo_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vehicles table
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => drivingSchools.id).notNull(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year'),
  plateNumber: text('plate_number').notNull(),
  transmission: text('transmission').notNull(), // automatic, manual
  photoUrl: text('photo_url'),
  registrationDocUrl: text('registration_doc_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Student profiles table
export const studentProfiles = pgTable('student_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  dateOfBirth: timestamp('date_of_birth'),
  idNumber: text('id_number'),
  address: text('address'),
  emergencyContact: text('emergency_contact'),
  emergencyPhone: text('emergency_phone'),
  medicalConditions: text('medical_conditions'),
  learnerLicenseNumber: text('learner_license_number'),
  learnerLicenseExpiry: timestamp('learner_license_expiry'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Lessons table
export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => studentProfiles.id).notNull(),
  bookingId: integer('booking_id').references(() => bookings.id),
  instructorId: integer('instructor_id').references(() => instructors.id).notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  lessonDate: timestamp('lesson_date').notNull(),
  duration: integer('duration').notNull(), // in minutes
  status: text('status').notNull().default('scheduled'), // scheduled, completed, cancelled
  instructorNotes: text('instructor_notes'),
  studentNotes: text('student_notes'),
  skillsAssessed: text('skills_assessed'), // JSON array of skill names
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Instructor-Student Assignments table
export const instructorStudentAssignments = pgTable('instructor_student_assignments', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => drivingSchools.id).notNull(),
  instructorId: integer('instructor_id').references(() => instructors.id).notNull(),
  studentId: integer('student_id').references(() => studentProfiles.id).notNull(),
  assignedDate: timestamp('assigned_date').defaultNow().notNull(),
  assignedBy: integer('assigned_by').references(() => users.id).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Assessments table
export const assessments = pgTable('assessments', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => studentProfiles.id).notNull(),
  instructorId: integer('instructor_id').references(() => instructors.id).notNull(),
  assessmentDate: timestamp('assessment_date').notNull(),
  assessmentType: text('assessment_type').notNull(), // practical, theory, final
  overallScore: integer('overall_score'),
  maxScore: integer('max_score').default(100),
  passed: boolean('passed').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Skill Evaluations table
export const skillEvaluations = pgTable('skill_evaluations', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').references(() => lessons.id).notNull(),
  skillName: text('skill_name').notNull(),
  rating: integer('rating').notNull(), // 1-5 scale
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Success Stories table
export const successStories = pgTable('success_stories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  schoolId: integer('school_id').references(() => drivingSchools.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  rating: integer('rating').notNull(), // 1-5 scale
  approved: boolean('approved').default(false),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Registration tokens table
export const registrationTokens = pgTable('registration_tokens', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').references(() => bookings.id).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// System settings table
export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value'),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Schema exports
export const instructorsInsertSchema = createInsertSchema(instructors);
export const instructorsSelectSchema = createSelectSchema(instructors);
export const vehiclesInsertSchema = createInsertSchema(vehicles);
export const vehiclesSelectSchema = createSelectSchema(vehicles);
export const studentProfilesInsertSchema = createInsertSchema(studentProfiles);
export const studentProfilesSelectSchema = createSelectSchema(studentProfiles);
export const lessonsInsertSchema = createInsertSchema(lessons);
export const lessonsSelectSchema = createSelectSchema(lessons);
export const instructorStudentAssignmentsInsertSchema = createInsertSchema(instructorStudentAssignments);
export const instructorStudentAssignmentsSelectSchema = createSelectSchema(instructorStudentAssignments);
export const assessmentsInsertSchema = createInsertSchema(assessments);
export const assessmentsSelectSchema = createSelectSchema(assessments);
export const skillEvaluationsInsertSchema = createInsertSchema(skillEvaluations);
export const skillEvaluationsSelectSchema = createSelectSchema(skillEvaluations);
export const successStoriesInsertSchema = createInsertSchema(successStories);
export const successStoriesSelectSchema = createSelectSchema(successStories);
export const passwordResetTokensInsertSchema = createInsertSchema(passwordResetTokens);
export const passwordResetTokensSelectSchema = createSelectSchema(passwordResetTokens);
export const registrationTokensInsertSchema = createInsertSchema(registrationTokens);
export const registrationTokensSelectSchema = createSelectSchema(registrationTokens);
export const systemSettingsInsertSchema = createInsertSchema(systemSettings);
export const systemSettingsSelectSchema = createSelectSchema(systemSettings);

// Type exports
export type Instructor = z.infer<typeof instructorsSelectSchema>;
export type InsertInstructor = z.infer<typeof instructorsInsertSchema>;
export type Vehicle = z.infer<typeof vehiclesSelectSchema>;
export type InsertVehicle = z.infer<typeof vehiclesInsertSchema>;
export type StudentProfile = z.infer<typeof studentProfilesSelectSchema>;
export type InsertStudentProfile = z.infer<typeof studentProfilesInsertSchema>;
export type Lesson = z.infer<typeof lessonsSelectSchema>;
export type InsertLesson = z.infer<typeof lessonsInsertSchema>;
export type InstructorStudentAssignment = z.infer<typeof instructorStudentAssignmentsSelectSchema>;
export type InsertInstructorStudentAssignment = z.infer<typeof instructorStudentAssignmentsInsertSchema>;
export type Assessment = z.infer<typeof assessmentsSelectSchema>;
export type InsertAssessment = z.infer<typeof assessmentsInsertSchema>;
export type SkillEvaluation = z.infer<typeof skillEvaluationsSelectSchema>;
export type InsertSkillEvaluation = z.infer<typeof skillEvaluationsInsertSchema>;

// Export additional schemas for compatibility
// Search criteria schema for school filtering
export const searchCriteriaSchema = z.object({
  location: z.string().optional(),
  serviceType: z.string().optional(),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  rating: z.number().min(1).max(5).optional(),
});

export const insertBookingSchema = bookingsInsertSchema;
export const insertUserSchema = usersInsertSchema;
export const insertDrivingSchoolSchema = drivingSchoolsInsertSchema;
export const insertServiceSchema = servicesInsertSchema;
export const insertInstructorSchema = instructorsInsertSchema;
export const insertVehicleSchema = vehiclesInsertSchema;
export const insertStudentProfileSchema = studentProfilesInsertSchema;
export const insertLessonSchema = lessonsInsertSchema;
export const insertInstructorStudentAssignmentSchema = instructorStudentAssignmentsInsertSchema;
export const insertAssessmentSchema = assessmentsInsertSchema;
export const insertSkillEvaluationSchema = skillEvaluationsInsertSchema;
export const insertSuccessStorySchema = successStoriesInsertSchema;
export const insertPasswordResetTokenSchema = passwordResetTokensInsertSchema;
export const insertRegistrationTokenSchema = registrationTokensInsertSchema;
