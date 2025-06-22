import { pgTable, serial, text, integer, timestamp, decimal, boolean, jsonb } from 'drizzle-orm/pg-core';
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
  role: text('role').notNull().default('student'), // 'student', 'school', 'admin'
  phoneNumber: text('phone_number'),
  address: text('address'),
  profilePicture: text('profile_picture'),
  isActive: boolean('is_active').default(true),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Driving Schools table
export const drivingSchools = pgTable('driving_schools', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  schoolName: text('school_name').notNull(),
  registrationNumber: text('registration_number').unique(),
  location: text('location').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone').notNull(),
  website: text('website'),
  description: text('description'),
  operatingHours: text('operating_hours'),
  profileImage: text('profile_image'),
  verified: boolean('verified').default(false),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  totalReviews: integer('total_reviews').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Services table
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => drivingSchools.id).notNull(),
  serviceName: text('service_name').notNull(),
  description: text('description'),
  duration: integer('duration').notNull(), // in minutes
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: text('category').notNull(), // 'basic', 'advanced', 'highway', 'parking', 'defensive', 'license'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Instructors table
export const instructors = pgTable('instructors', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => drivingSchools.id).notNull(),
  fullName: text('full_name').notNull(),
  licenseNumber: text('license_number').notNull(),
  phoneNumber: text('phone_number').notNull(),
  email: text('email').notNull(),
  yearsExperience: integer('years_experience'),
  specializations: jsonb('specializations'), // array of specialization strings
  bio: text('bio'),
  profileImage: text('profile_image'),
  isActive: boolean('is_active').default(true),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  totalReviews: integer('total_reviews').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Vehicles table
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => drivingSchools.id).notNull(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  registrationNumber: text('registration_number').notNull(),
  transmissionType: text('transmission_type').notNull(), // 'manual', 'automatic'
  fuelType: text('fuel_type').notNull(), // 'petrol', 'diesel', 'electric', 'hybrid'
  condition: text('condition').notNull(), // 'excellent', 'good', 'fair'
  features: jsonb('features'), // array of feature strings
  image: text('image'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Bookings table
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  schoolId: integer('school_id').references(() => drivingSchools.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  instructorId: integer('instructor_id').references(() => instructors.id),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  scheduledDate: timestamp('scheduled_date').notNull(),
  duration: integer('duration').notNull(), // in minutes
  status: text('status').notNull().default('pending'), // 'pending', 'confirmed', 'completed', 'cancelled'
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text('payment_status').default('pending'), // 'pending', 'paid', 'failed', 'refunded'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  drivingSchool: one(drivingSchools, { fields: [users.id], references: [drivingSchools.userId] }),
  bookings: many(bookings, { relationName: "student_bookings" })
}));

export const drivingSchoolsRelations = relations(drivingSchools, ({ one, many }) => ({
  user: one(users, { fields: [drivingSchools.userId], references: [users.id] }),
  services: many(services),
  instructors: many(instructors),
  vehicles: many(vehicles),
  bookings: many(bookings)
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  school: one(drivingSchools, { fields: [services.schoolId], references: [drivingSchools.id] }),
  bookings: many(bookings)
}));

export const instructorsRelations = relations(instructors, ({ one, many }) => ({
  school: one(drivingSchools, { fields: [instructors.schoolId], references: [drivingSchools.id] }),
  bookings: many(bookings)
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  school: one(drivingSchools, { fields: [vehicles.schoolId], references: [drivingSchools.id] }),
  bookings: many(bookings)
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  student: one(users, { fields: [bookings.studentId], references: [users.id], relationName: "student_bookings" }),
  school: one(drivingSchools, { fields: [bookings.schoolId], references: [drivingSchools.id] }),
  service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
  instructor: one(instructors, { fields: [bookings.instructorId], references: [instructors.id] }),
  vehicle: one(vehicles, { fields: [bookings.vehicleId], references: [vehicles.id] })
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertDrivingSchoolSchema = createInsertSchema(drivingSchools);
export const selectDrivingSchoolSchema = createSelectSchema(drivingSchools);
export type DrivingSchool = z.infer<typeof selectDrivingSchoolSchema>;
export type InsertDrivingSchool = z.infer<typeof insertDrivingSchoolSchema>;

export const insertServiceSchema = createInsertSchema(services);
export const selectServiceSchema = createSelectSchema(services);
export type Service = z.infer<typeof selectServiceSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;

export const insertInstructorSchema = createInsertSchema(instructors);
export const selectInstructorSchema = createSelectSchema(instructors);
export type Instructor = z.infer<typeof selectInstructorSchema>;
export type InsertInstructor = z.infer<typeof insertInstructorSchema>;

export const insertVehicleSchema = createInsertSchema(vehicles);
export const selectVehicleSchema = createSelectSchema(vehicles);
export type Vehicle = z.infer<typeof selectVehicleSchema>;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export const insertBookingSchema = createInsertSchema(bookings);
export const selectBookingSchema = createSelectSchema(bookings);
export type Booking = z.infer<typeof selectBookingSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
