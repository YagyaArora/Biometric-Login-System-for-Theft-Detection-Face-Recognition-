
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, LogOut, User, Shield, AlertCircle } from 'lucide-react';

interface UserData {
  userId: string;
  username: string;
  email: string;
  hasFaceData: boolean;
}

const Dashboard = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [sessionStart] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Get user data from location state or redirect to login
    if (location.state?.userId) {
      setUserData({
        userId: location.state.userId,
        username: location.state.username || 'User',
        email: location.state.email || '',
        hasFaceData: location.state.hasFaceData || false
      });
    } else {
      toast({
        title: 'Error',
        description: 'Please login first',
        variant: 'destructive'
      });
      navigate('/login');
    }
  }, [location.state, navigate, toast]);

  const handleLogout = () => {
    // Clear any stored tokens or session data here if needed
    // For now, just redirect to home
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome to your secure portal</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Success Message */}
        <Card className="mb-8 border-green-200 bg-green-50/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-12 h-12 text-green-600 animate-pulse" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-green-800 mb-2">
                  Login Successfully Completed!
                </h2>
                <p className="text-green-700">
                  Your identity has been verified using two-step authentication
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>User Profile</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Username</label>
                <p className="text-lg font-semibold">{userData.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{userData.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-sm text-gray-600 font-mono">{userData.userId}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Security Status</CardTitle>
                  <CardDescription>Authentication details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Verification</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 text-sm font-medium">Verified</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Face Recognition</span>
                <div className="flex items-center space-x-2">
                  {userData.hasFaceData ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 text-sm font-medium">Registered</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-600 text-sm font-medium">Not Registered</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">2FA Status</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 text-sm font-medium">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Info */}
        <Card className="mt-6 bg-gray-50/70 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p>Session started: {sessionStart.toLocaleString()}</p>
              <p className="mt-1">You are securely authenticated with face recognition technology</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
