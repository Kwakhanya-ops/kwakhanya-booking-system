import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Filter,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { Link } from "wouter";

export default function BookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status, paymentStatus }: { 
      bookingId: number; 
      status?: string; 
      paymentStatus?: string; 
    }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}`, {
        status,
        paymentStatus
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking updated",
        description: "The booking has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "confirmed":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      confirmed: "secondary",
      pending: "outline",
      cancelled: "destructive"
    };
    return variants[status as keyof typeof variants] || "outline";
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      paid: "default",
      pending: "outline",
      failed: "destructive",
      refunded: "secondary"
    };
    return variants[status as keyof typeof variants] || "outline";
  };

  const handleStatusUpdate = (bookingId: number, newStatus: string) => {
    updateBookingMutation.mutate({ bookingId, status: newStatus });
  };

  const handlePaymentStatusUpdate = (bookingId: number, newPaymentStatus: string) => {
    updateBookingMutation.mutate({ bookingId, paymentStatus: newPaymentStatus });
  };

  const filteredBookings = bookings?.filter((booking: any) => {
    if (statusFilter === "all") return true;
    return booking.status === statusFilter;
  }) || [];

  const upcomingBookings = bookings?.filter((booking: any) => 
    booking.status === "confirmed" && new Date(booking.scheduledDate) > new Date()
  ) || [];

  const pastBookings = bookings?.filter((booking: any) => 
    booking.status === "completed" || new Date(booking.scheduledDate) < new Date()
  ) || [];

  if (selectedBooking) {
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
                  onClick={() => setSelectedBooking(null)}
                  size="sm"
                >
                  Back to Bookings
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Booking Details</CardTitle>
                  <CardDescription>Booking ID: #{selectedBooking.id}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedBooking.status)}
                  <Badge variant={getStatusBadge(selectedBooking.status)}>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Information */}
              <div>
                <h3 className="font-semibold mb-3">Service Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Service</p>
                    <p className="font-medium">{selectedBooking.service?.serviceName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{selectedBooking.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium">{selectedBooking.service?.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-medium text-green-600">R{parseFloat(selectedBooking.totalAmount).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* School Information */}
              <div>
                <h3 className="font-semibold mb-3">School Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">School Name</p>
                    <p className="font-medium">{selectedBooking.school?.schoolName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{selectedBooking.school?.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Phone</p>
                    <p className="font-medium">{selectedBooking.school?.contactPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Email</p>
                    <p className="font-medium">{selectedBooking.school?.contactEmail}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Scheduled Date */}
              <div>
                <h3 className="font-semibold mb-3">Schedule</h3>
                <div className="flex items-center space-x-4">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {new Date(selectedBooking.scheduledDate).toLocaleDateString('en-ZA', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedBooking.scheduledDate).toLocaleTimeString('en-ZA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Instructor Information */}
              {selectedBooking.instructor && (
                <>
                  <div>
                    <h3 className="font-semibold mb-3">Instructor</h3>
                    <div className="flex items-center space-x-4">
                      {selectedBooking.instructor.profileImage && (
                        <img 
                          src={selectedBooking.instructor.profileImage} 
                          alt={selectedBooking.instructor.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{selectedBooking.instructor.fullName}</p>
                        <p className="text-sm text-gray-600">{selectedBooking.instructor.phoneNumber}</p>
                        <p className="text-sm text-gray-600">{selectedBooking.instructor.email}</p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Payment Information */}
              <div>
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <Badge variant={getPaymentStatusBadge(selectedBooking.paymentStatus)}>
                      {selectedBooking.paymentStatus}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      R{parseFloat(selectedBooking.totalAmount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions for School Users */}
              {user?.role === "school" && selectedBooking.status === "pending" && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Actions</h3>
                    <div className="flex space-x-3">
                      <Button 
                        onClick={() => handleStatusUpdate(selectedBooking.id, "confirmed")}
                        disabled={updateBookingMutation.isPending}
                      >
                        Confirm Booking
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleStatusUpdate(selectedBooking.id, "cancelled")}
                        disabled={updateBookingMutation.isPending}
                      >
                        Cancel Booking
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Notes */}
              {selectedBooking.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Notes</h3>
                    <p className="text-gray-600">{selectedBooking.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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
              <Link href="/dashboard">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
              {user?.role === "student" && (
                <Link href="/schools">
                  <Button size="sm">Book New Lesson</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === "student" ? "My Bookings" : "School Bookings"}
          </h1>
          <p className="text-lg text-gray-600">
            {user?.role === "student" 
              ? "Manage your driving lesson bookings" 
              : "Review and manage student bookings"
            }
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bookings</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {filteredBookings.length > 0 ? (
                <div className="space-y-4">
                  {filteredBookings.map((booking: any) => (
                    <Card key={booking.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              {getStatusIcon(booking.status)}
                              <h3 className="font-semibold">
                                {user?.role === "student" 
                                  ? booking.school?.schoolName 
                                  : booking.student?.fullName
                                }
                              </h3>
                              <Badge variant={getStatusBadge(booking.status)}>
                                {booking.status}
                              </Badge>
                              <Badge variant={getPaymentStatusBadge(booking.paymentStatus)}>
                                {booking.paymentStatus}
                              </Badge>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>{booking.duration} minutes</span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2" />
                                <span>R{parseFloat(booking.totalAmount).toFixed(2)}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              {booking.service?.serviceName} - {booking.service?.category}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            {user?.role === "school" && booking.status === "pending" && (
                              <>
                                <Button 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                                  disabled={updateBookingMutation.isPending}
                                >
                                  Confirm
                                </Button>
                                <Button 
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                                  disabled={updateBookingMutation.isPending}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-600 mb-4">
                      {statusFilter === "all" 
                        ? "You don't have any bookings yet" 
                        : `No ${statusFilter} bookings found`
                      }
                    </p>
                    {user?.role === "student" && (
                      <Link href="/schools">
                        <Button>Book Your First Lesson</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="upcoming">
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking: any) => (
                    <Card key={booking.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              {getStatusIcon(booking.status)}
                              <h3 className="font-semibold">
                                {user?.role === "student" 
                                  ? booking.school?.schoolName 
                                  : booking.student?.fullName
                                }
                              </h3>
                              <Badge variant={getStatusBadge(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>{new Date(booking.scheduledDate).toLocaleTimeString()}</span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2" />
                                <span>R{parseFloat(booking.totalAmount).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                    <p className="text-gray-600">Your next lessons will appear here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastBookings.length > 0 ? (
                <div className="space-y-4">
                  {pastBookings.map((booking: any) => (
                    <Card key={booking.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              {getStatusIcon(booking.status)}
                              <h3 className="font-semibold">
                                {user?.role === "student" 
                                  ? booking.school?.schoolName 
                                  : booking.student?.fullName
                                }
                              </h3>
                              <Badge variant={getStatusBadge(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>{booking.duration} minutes</span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2" />
                                <span>R{parseFloat(booking.totalAmount).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No past bookings</h3>
                    <p className="text-gray-600">Your completed lessons will appear here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
              }
