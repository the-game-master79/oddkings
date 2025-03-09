import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileImage } from "@/components/profile/ProfileImage";
import { EmailVerification } from "@/components/profile/EmailVerification";
import { KYCVerification } from "@/components/profile/KYCVerification";
import { ResetPasswordDialog } from "@/components/profile/ResetPasswordDialog";

const Profile = () => {
  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6 space-y-6">
      <h1 className="text-3xl font-bold text-left">Profile</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="text-left">
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-left">
            <ProfileImage />
            
            {/* Password Reset Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
              <ResetPasswordDialog />
            </div>

            <EmailVerification />
          </CardContent>
        </Card>
        
        <KYCVerification />
      </div>
    </div>
  );
};

export default Profile;
