import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { drivingSchools, services, bookings, instructors, vehicles, users } from "@shared/schema";
import { eq, and, like, desc, asc } from "drizzle-orm";
import { insertDrivingSchoolSchema, insertServiceSchema, insertBookingSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  
  // Schools routes
  app.get("/api/schools", async (req, res) => {
    try {
      const { location, search } = req.query;
      
      let query = db.query.drivingSchools.findMany({
        with: {
          services: true,
          instructors: true,
          vehicles: true
        },
        orderBy: [desc(drivingSchools.rating), asc(drivingSchools.schoolName)]
      });

      let schools = await query;

      // Filter by location if provided
      if (location && typeof location === 'string') {
        schools = schools.filter(school => 
          school.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      // Filter by search term if provided
      if (search && typeof search === 'string') {
        schools = schools.filter(school => 
          school.schoolName.toLowerCase().includes(search.toLowerCase()) ||
          school.description?.toLowerCase().includes(search.toLowerCase())
        );
      }

      res.json(schools);
    } catch (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/schools/:id", async (req, res) => {
    try {
      const schoolId = parseInt(req.params.id);
      
      const school = await db.query.drivingSchools.findFirst({
        where: eq(drivingSchools.id, schoolId),
        with: {
          services: true,
          instructors: true,
          vehicles: true,
          user: true
        }
      });

      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }

      res.json(school);
    } catch (error) {
      console.error("Error fetching school:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/schools", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'school') {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertDrivingSchoolSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      const [newSchool] = await db.insert(drivingSchools).values(validatedData).returning();
      res.status(201).json(newSchool);
    } catch (error) {
      console.error("Error creating school:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const { schoolId, category } = req.query;
      
      let whereConditions = [];
      
      if (schoolId) {
        whereConditions.push(eq(services.schoolId, parseInt(schoolId as string)));
      }
      
      if (category && category !== 'all') {
        whereConditions.push(eq(services.category, category as string));
      }

      const servicesList = await db.query.services.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        with: {
          school: true
        },
        orderBy: [asc(services.price)]
      });

      res.json(servicesList);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'school') {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertServiceSchema.parse(req.body);
      const [newService] = await db.insert(services).values(validatedData).returning();
      
      res.status(201).json(newService);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Bookings routes
  app.get("/api/bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let whereCondition;
      
      if (req.user.role === 'student') {
        whereCondition = eq(bookings.studentId, req.user.id);
      } else if (req.user.role === 'school') {
        // Get school ID for the authenticated school user
        const school = await db.query.drivingSchools.findFirst({
          where: eq(drivingSchools.userId, req.user.id)
        });
        
        if (!school) {
          return res.status(404).json({ message: "School profile not found" });
        }
        
        whereCondition = eq(bookings.schoolId, school.id);
      }

      const userBookings = await db.query.bookings.findMany({
        where: whereCondition,
        with: {
          student: true,
          school: true,
          service: true,
          instructor: true,
          vehicle: true
        },
        orderBy: [desc(bookings.createdAt)]
      });

      res.json(userBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'student') {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertBookingSchema.parse({
        ...req.body,
        studentId: req.user.id
      });

      const [newBooking] = await db.insert(bookings).values(validatedData).returning();
      
      // Fetch the complete booking with relations
      const completeBooking = await db.query.bookings.findFirst({
        where: eq(bookings.id, newBooking.id),
        with: {
          student: true,
          school: true,
          service: true,
          instructor: true,
          vehicle: true
        }
      });

      res.status(201).json(completeBooking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const bookingId = parseInt(req.params.id);
      const { status, paymentStatus } = req.body;

      const [updatedBooking] = await db
        .update(bookings)
        .set({ 
          status,
          paymentStatus,
          updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId))
        .returning();

      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let stats = {};

      if (req.user.role === 'admin') {
        const totalUsers = await db.query.users.findMany();
        const totalSchools = await db.query.drivingSchools.findMany();
        const totalBookings = await db.query.bookings.findMany();
        
        stats = {
          totalUsers: totalUsers.length,
          totalSchools: totalSchools.length,
          totalBookings: totalBookings.length,
          pendingBookings: totalBookings.filter(b => b.status === 'pending').length
        };
      } else if (req.user.role === 'school') {
        const school = await db.query.drivingSchools.findFirst({
          where: eq(drivingSchools.userId, req.user.id)
        });
        
        if (school) {
          const schoolBookings = await db.query.bookings.findMany({
            where: eq(bookings.schoolId, school.id)
          });
          
          stats = {
            totalBookings: schoolBookings.length,
            pendingBookings: schoolBookings.filter(b => b.status === 'pending').length,
            completedBookings: schoolBookings.filter(b => b.status === 'completed').length,
            totalRevenue: schoolBookings
              .filter(b => b.paymentStatus === 'paid')
              .reduce((sum, b) => sum + parseFloat(b.totalAmount.toString()), 0)
          };
        }
      } else if (req.user.role === 'student') {
        const studentBookings = await db.query.bookings.findMany({
          where: eq(bookings.studentId, req.user.id)
        });
        
        stats = {
          totalBookings: studentBookings.length,
          upcomingBookings: studentBookings.filter(b => 
            b.status === 'confirmed' && new Date(b.scheduledDate) > new Date()
          ).length,
          completedBookings: studentBookings.filter(b => b.status === 'completed').length
        };
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
          }
