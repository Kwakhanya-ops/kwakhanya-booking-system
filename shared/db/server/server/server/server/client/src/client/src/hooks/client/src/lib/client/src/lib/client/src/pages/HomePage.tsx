import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Users, Shield, Car } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [searchLocation, setSearchLocation] = useState("");

  const handleSearch = () => {
    if (searchLocation.trim()) {
      setLocation(`/schools?location=${encodeURIComponent(searchLocation)}`);
    } else {
      setLocation("/schools");
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Verified Schools",
      description: "All driving schools are verified for quality and safety standards"
    },
    {
      icon: Users,
      title: "Qualified Instructors",
      description: "Learn from experienced, certified driving instructors"
    },
    {
      icon: Car,
      title: "Modern Vehicles",
      description: "Practice with well-maintained, modern training vehicles"
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Book lessons at times that work for your schedule"
    }
  ];

  const services = [
    { name: "Learner's License", duration: "2-3 hours", price: "From R350" },
    { name: "Driving Lessons", duration: "1 hour", price: "From R200" },
    { name: "Defensive Driving", duration: "4 hours", price: "From R800" },
    { name: "License Test Preparation", duration: "2 hours", price: "From R400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Kwakhanya Drivers</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/schools">
                <Button variant="ghost">Find Schools</Button>
              </Link>
              {user ? (
                <>
                  <Link href="/bookings">
                    <Button variant="ghost">My Bookings</Button>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Welcome, {user.fullName}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                    >
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <Link href="/auth">
                  <Button>Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Learn to Drive with
            <span className="text-blue-600 block">Confidence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with verified driving schools across South Africa.
            Book lessons, track your progress, and get your license with expert guidance.
          </p>

          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 mb-12">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Enter your location (e.g., Cape Town, Johannesburg)"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10 py-3 text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} size="lg" className="px-8 py-3">
              <Search className="h-5 w-5 mr-2" />
              Find Schools
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.duration}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-600 font-bold">{service.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Kwakhanya Drivers. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
