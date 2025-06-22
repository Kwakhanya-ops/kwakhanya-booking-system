import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Car, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Clock, 
  Users, 
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  DollarSign
} from "lucide-react";
import { Link } from "wouter";

export default function SchoolsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<any>(null);

  const { data: schools, isLoading } = useQuery({
    queryKey: ["/api/schools", { location: locationFilter, search: searchTerm }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationFilter) params.append("location", locationFilter);
      if (searchTerm) params.append("search", searchTerm);
      
      const response = await fetch(`/api/schools?${params}`);
      if (!response.ok) throw new Error("Failed to fetch schools");
      return response.json();
    },
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services", { schoolId: selectedSchool?.id }],
    queryFn: async () => {
      if (!selectedSchool?.id) return [];
      
      const response = await fetch(`/api/services?schoolId=${selectedSchool.id}`);
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
    enabled: !!selectedSchool?.id,
  });

  const handleBookLesson = (service: any) => {
    // In a real app, this would navigate to booking page
    console.log("Booking service:", service);
  };

  if (selectedSchool) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">Kwakhanya Drivers</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedSchool(null)}
                  size="sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Schools
                </Button>
                {user && (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* School Details */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedSchool.schoolName}</CardTitle>
                      <div className="flex items-center mt-2 text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{selectedSchool.location}</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="font-medium">{selectedSchool.rating}</span>
                        <span className="text-gray-600 ml-1">({selectedSchool.totalReviews} reviews)</span>
                        {selectedSchool.verified && (
                          <Badge className="ml-2" variant="secondary">Verified</Badge>
                        )}
                      </div>
                    </div>
                    {selectedSchool.profileImage && (
                      <img 
                        src={selectedSchool.profileImage} 
                        alt={selectedSchool.schoolName}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-gray-600">{selectedSchool.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedSchool.contactPhone}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedSchool.contactEmail}</span>
                        </div>
                        {selectedSchool.operatingHours && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{selectedSchool.operatingHours}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedSchool.instructors && selectedSchool.instructors.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Instructors</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {selectedSchool.instructors.map((instructor: any) => (
                            <div key={instructor.id} className="border rounded-lg p-4">
                              <div className="flex items-center space-x-3">
                                {instructor.profileImage && (
                                  <img 
                                    src={instructor.profileImage} 
                                    alt={instructor.fullName}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{instructor.fullName}</p>
                                  <p className="text-sm text-gray-600">{instructor.yearsExperience} years experience</p>
                                  <div className="flex items-center">
                                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                    <span className="text-sm">{instructor.rating}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Services Sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Available Services</CardTitle>
                  <CardDescription>Choose from our driving lesson packages</CardDescription>
                </CardHeader>
                <CardContent>
                  {services && services.length > 0 ? (
                    <div className="space-y-4">
                      {services.map((service: any) => (
                        <div key={service.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{service.serviceName}</h4>
                            <Badge variant="outline">{service.category}</Badge>
                          </div>
                          {service.description && (
                            <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{service.duration}
