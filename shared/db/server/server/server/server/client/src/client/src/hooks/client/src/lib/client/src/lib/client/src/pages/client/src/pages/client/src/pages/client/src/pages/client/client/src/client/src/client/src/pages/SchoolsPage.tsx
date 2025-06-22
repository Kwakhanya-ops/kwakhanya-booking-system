import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Clock, Star, Phone, Mail, ArrowLeft, Car } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface School {
  id: number;
  schoolName: string;
  description: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  verified: boolean;
  services: Service[];
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: number;
}

export default function SchoolsPage() {
  const [searchLocation, setSearchLocation] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [, setLocation] = useLocation();

  const { data: schools, isLoading, error } = useQuery({
    queryKey: ["/api/schools", searchLocation, serviceFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchLocation) params.append("location", searchLocation);
      if (serviceFilter) params.append("service", serviceFilter);
      
      const response = await apiRequest("GET", `/api/schools?${params.toString()}`);
      return await response.json();
    },
  });

  const handleSearch = () => {
    // Trigger refetch by updating query key dependencies
  };

  const handleBooking = (schoolId: number) => {
    setLocation(`/booking/${schoolId}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Schools</h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center">
                <Car className="h-6 w-6 text-blue-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900">Find Driving Schools</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Enter location (e.g., Cape Town, Johannesburg)"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_services">All Services</SelectItem>
                <SelectItem value="learners">Learner's License</SelectItem>
                <SelectItem value="lessons">Driving Lessons</SelectItem>
                <SelectItem value="defensive">Defensive Driving</SelectItem>
                <SelectItem value="test_prep">Test Preparation</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} className="md:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="h-64">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : schools && schools.length > 0 ? (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Found {schools.length} driving school{schools.length !== 1 ? 's' : ''}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.map((school: School) => (
                <Card key={school.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{school.schoolName}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {school.location}
                        </CardDescription>
                      </div>
                      {school.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {school.description || "Professional driving instruction with experienced instructors."}
                    </p>
                    
                    {school.services && school.services.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Services Offered:</h4>
                        <div className="flex flex-wrap gap-1">
                          {school.services.slice(0, 3).map((service: Service) => (
                            <Badge key={service.id} variant="outline" className="text-xs">
                              {service.name} - R{service.price}
                            </Badge>
                          ))}
                          {school.services.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{school.services.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {school.contactPhone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {school.contactEmail}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => handleBooking(school.id)}
                      >
                        Book Now
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schools Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search location or service type filters.
            </p>
            <Button onClick={() => {
              setSearchLocation("");
              setServiceFilter("");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
