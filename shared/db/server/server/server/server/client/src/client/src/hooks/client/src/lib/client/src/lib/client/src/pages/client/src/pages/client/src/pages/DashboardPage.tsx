import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  Calendar, 
  Users, 
  BookOpen, 
  Settings,
  Bell,
  TrendingUp,
  Clock
} from "lucide-react";
import { Link } from "wouter";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();

  if (!user) {
    return null;
  }

  const getDashboardContent = () => {
    switch (user.role) {
      case "student":
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/schools">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Car className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Find Schools</h3>
                    <p className="text-sm text-gray-600">Browse and book driving lessons</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/bookings">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">My Bookings</h3>
                    <p className="text-sm text-gray-600">View upcoming lessons</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/profile">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Profile</h3>
                    <p className="text-sm text-gray-600">Manage your account</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest bookings and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                  <p className="text-sm text-gray-500 mt-2">Book your first lesson to get started!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "school":
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Students</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold">R0</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Instructors</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/bookings">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Manage Bookings</h3>
                    <p className="text-sm text-gray-600">View and manage student bookings</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/profile">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Settings className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">School Profile</h3>
                    <p className="text-sm text-gray-600">Update school information</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Instructors</h3>
                  <p className="text-sm text-gray-600">Manage your instructors</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "admin":
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Schools</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Car className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Bookings</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold">R0</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
                <CardDescription>Manage the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-16">
                    <Users className="h-5 w-5 mr-2" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="h-16">
                    <Car className="h-5 w-5 mr-2" />
                    Manage Schools
                  </Button>
                  <Button variant="outline" className="h-16">
                    <Calendar className="h-5 w-5 mr-2" />
                    View All Bookings
                  </Button>
                  <Button variant="outline" className="h-16">
                    <Settings className="h-5 w-5 mr-2" />
                    System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">Welcome to your dashboard</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Kwakhanya Drivers</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{user.role}</Badge>
                <span className="text-sm text-gray-600">Welcome, {user.fullName || user.username}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user.role === "student" && "Student Dashboard"}
            {user.role === "school" && "School Dashboard"}
            {user.role === "admin" && "Admin Dashboard"}
          </h1>
          <p className="text-lg text-gray-600">
            {user.role === "student" && "Manage your driving lessons and track progress"}
            {user.role === "school" && "Manage your driving school and student bookings"}
            {user.role === "admin" && "Oversee platform operations and user management"}
          </p>
        </div>

        {getDashboardContent()}
      </div>
    </div>
  );
}
