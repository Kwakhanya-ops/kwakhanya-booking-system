import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Car, Users, GraduationCap, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["student", "school"], {
    required_error: "Please select your account type",
  }),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      role: undefined,
    },
  });

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const onLogin = async (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const onRegister = async (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Car className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Kwakhanya Drivers</span>
            </Link>
            <Link href="/">
              <Button variant="outline">← Back to Home</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Left Column - Hero */}
        <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <h1 className="text-4xl font-bold mb-6">
              Start Your Driving Journey Today
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of students who have learned to drive safely with our certified driving schools across South Africa.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Shield className="h-6 w-6 mr-3 text-blue-300" />
                <span>Verified & certified driving schools</span>
              </div>
              <div className="flex items-center">
                <Users className="h-6 w-6 mr-3 text-blue-300" />
                <span>Professional instructors</span>
              </div>
              <div className="flex items-center
