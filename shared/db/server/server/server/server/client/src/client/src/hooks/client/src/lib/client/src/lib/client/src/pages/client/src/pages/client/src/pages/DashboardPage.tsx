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
    return <div>Loading...</div>;
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
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Profile</h3>
                  <p className="text-sm text-gray-600">Manage your account</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest bookings and progress</CardDescription>
