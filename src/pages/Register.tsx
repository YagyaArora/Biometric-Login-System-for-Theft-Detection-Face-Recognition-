
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Camera from '@/components/Camera';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { authApi, faceApi, base64ToFile } from '@/lib/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1); // 1: Form, 2: Face Capture

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await authApi.register(
        formData.username,
        formData.email,
        formData.password
      );
      
      if (error) {
        throw new Error(error);
      }
      
      if (data) {
        setUserId(data.user_id);
        setCurrentStep(2); // Move to face capture step
        
        toast({
          title: 'Account Created!',
          description: 'Please register your face to complete setup',
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceCapture = async (imageData: string) => {
    if (!userId) return;
    
    setIsCapturing(true);
    setFaceImage(imageData);
    
    try {
      // Convert base64 to File object
      const faceFile = await base64ToFile(imageData, 'face.jpg');
      
      // Register face with the backend
      const { error } = await faceApi.registerFace(userId, faceFile);
      
      if (error) {
        throw new Error(error);
      }
      
      toast({
        title: 'Success!',
        description: 'Your face has been registered successfully',
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', {
          state: { 
            message: 'Registration complete! Please log in with your credentials.' 
          }
        });
      }, 1500);
      
    } catch (error: any) {
      console.error('Face registration error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to register face',
        variant: 'destructive',
      });
      setFaceImage(null); // Allow retry
    } finally {
      setIsCapturing(false);
    }
  };
  
  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">
            {currentStep === 1 ? 'Create Account' : 'Capture Your Face'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 
              ? 'Fill in your details to get started' 
              : 'Position your face in the frame and capture a clear image'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {currentStep === 1 ? (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Continue to Face Capture'}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Welcome, {formData.username}!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Email: {formData.email}
                </p>
              </div>
              
              <div className="flex justify-center">
                <Camera onCapture={handleFaceCapture} isCapturing={isCapturing} />
              </div>
              
              {isCapturing && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Processing your face data...</p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 text-center">
            <button 
              onClick={handleBack}
              className="inline-flex items-center text-gray-600 hover:text-gray-800"
              disabled={isLoading || isCapturing}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {currentStep === 1 ? 'Back to Home' : 'Back to Form'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
