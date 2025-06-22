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
                              <span>{service.duration} min</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-semibold">R{parseFloat(service.price).toFixed(2)}</span>
                            </div>
                          </div>
                          {user?.role === "student" && (
                            <Button 
                              className="w-full mt-3" 
                              size="sm"
                              onClick={() => handleBookLesson(service)}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Book Lesson
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No services available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <Link href="/">
                <Button variant="outline" size="sm">Home</Button>
              </Link>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Driving Schools</h1>
          <p className="text-lg text-gray-600">Discover certified driving schools in your area</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Schools</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="School name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All locations</SelectItem>
                    <SelectItem value="johannesburg">Johannesburg</SelectItem>
                    <SelectItem value="cape town">Cape Town</SelectItem>
                    <SelectItem value="durban">Durban</SelectItem>
                    <SelectItem value="pretoria">Pretoria</SelectItem>
                    <SelectItem value="port elizabeth">Port Elizabeth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setLocationFilter("");
                  }}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schools Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading schools...</p>
          </div>
        ) : schools && schools.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school: any) => (
              <Card key={school.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {school.profileImage && (
                    <img 
                      src={school.profileImage} 
                      alt={school.schoolName}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{school.schoolName}</h3>
                      {school.verified && (
                        <Badge variant="secondary">Verified</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center mb-2 text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{school.location}</span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{school.rating}</span>
                      <span className="text-gray-600 ml-1 text-sm">({school.totalReviews} reviews)</span>
                    </div>
                    
                    {school.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{school.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{school.instructors?.length || 0} instructors</span>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => setSelectedSchool(school)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
                  }
