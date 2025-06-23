import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FaceDetectionCamera from '@/components/FaceDetectionCamera';
import { Loader2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { faceApi, base64ToFile } from '@/lib/api';

interface LocationState {
  userId: string;
  username: string;
  email: string;
  hasFaceData: boolean;
  from?: string;
}

interface UserData {
  userId: string;
  username: string;
  email: string;
  hasFaceData: boolean;
}

const FaceVerification = () => {
  const location = useLocation();
  const { userId, username, email, hasFaceData, from } = (location.state || {}) as LocationState;
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User information not found. Please log in again.',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [userId, navigate, toast]);

  const navigateToDashboard = (verified: boolean) => {
    if (!verified) {
      // If verification fails, redirect to login
      localStorage.removeItem('authToken');
      navigate('/login', { 
        state: { 
          error: 'Face verification failed. Please try again.' 
        } 
      });
      return;
    }

    // On successful verification, ensure we go to dashboard with user data
    navigate('/dashboard', {
      state: {
        userId,
        username,
        email,
        hasFaceData: true,
        isVerified: true,
        lastLogin: new Date().toISOString(),
      },
      replace: true // Replace current entry in history
    });
  };

  const handleFaceCapture = async (imageData: string) => {
    if (!userId) return;

    setIsVerifying(true);
    setVerificationStatus('idle');
    setFaceImage(imageData);

    try {
      const faceFile = await base64ToFile(imageData, 'face-verification.jpg');
      const { data, error } = await faceApi.verifyFace(userId, faceFile);

      if (error) {
        throw new Error(error);
      }

      if (data) {
        const confidencePercent = Math.round(data.confidence * 100);
        setConfidence(confidencePercent);

        if (data.verified) {
          setVerificationStatus('success');
          toast({
            title: 'Verification Successful!',
            description: `Face verified with ${confidencePercent}% confidence`,
          });
          setTimeout(() => navigateToDashboard(true), 1500);
        } else {
          setVerificationStatus('error');
          toast({
            title: 'Verification Failed',
            description: `Face verification failed (${confidencePercent}% confidence). Please try again.`,
            variant: 'destructive',
            duration: 3000,
          });
        }
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify face',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {verificationStatus === 'success' ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : verificationStatus === 'error' ? (
              <XCircle className="w-8 h-8 text-red-600" />
            ) : (
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {verificationStatus === 'success'
              ? 'Verification Successful!'
              : verificationStatus === 'error'
              ? 'Verification Failed'
              : 'Face Verification'}
          </CardTitle>
          <CardDescription>
            {verificationStatus === 'success'
              ? 'Welcome back! Redirecting to your dashboard...'
              : verificationStatus === 'error'
              ? 'Please try again or contact support'
              : `Hello ${username || 'User'}, please look at the camera for verification`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {verificationStatus === 'idle' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>User:</strong> {username}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {email || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {hasFaceData ? 'Face data registered' : 'No face data'}
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="text-gray-600 hover:bg-gray-100"
                  disabled={isVerifying}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {from ? 'Back to Previous Page' : 'Back to Home'}
                </Button>
              </div>

              <div className="flex justify-center">
                <FaceDetectionCamera onCapture={handleFaceCapture} isCapturing={isVerifying} />
              </div>

              {faceImage && !isVerifying && (
                <div className="flex flex-col items-center space-y-2 mt-4">
                  <p className="text-sm text-gray-600">Captured image preview:</p>
                  <img
                    src={faceImage}
                    alt="Captured face"
                    className="w-64 h-48 object-cover rounded-lg border"
                  />
                </div>
              )}

              {isVerifying && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Verifying your identity...</p>
                </div>
              )}
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center space-y-4">
              <div className="animate-bounce">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              </div>
              <h3 className="text-xl font-medium">Verification Successful!</h3>
              <p className="text-gray-600">
                You've been successfully verified with {confidence}% confidence.
              </p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center space-y-4">
              <XCircle className="w-16 h-16 text-red-600 mx-auto" />
              <h3 className="text-xl font-medium">Verification Failed</h3>
              <p className="text-gray-600">
                {confidence ? `Face match confidence too low (${confidence}%).` : 'Unable to process face image.'}
              </p>
              <Button 
                onClick={() => setVerificationStatus('idle')}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceVerification;
