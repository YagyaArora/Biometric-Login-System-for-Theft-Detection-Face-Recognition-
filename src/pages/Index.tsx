
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { User, Camera } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Secure Face Authentication
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience next-generation security with our two-step authentication system featuring facial recognition technology.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">New User</CardTitle>
              <CardDescription className="text-base">
                Create your account with secure face registration
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/register">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg">
                  Register Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Existing User</CardTitle>
              <CardDescription className="text-base">
                Login with your credentials and face verification
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/login">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg">
                  Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 bg-white/50 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-200">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 font-medium">Secure • Fast • Reliable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
