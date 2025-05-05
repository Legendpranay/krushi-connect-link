
import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserContainer from '../components/UserContainer';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <UserContainer>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/more')} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">Privacy Policy</h2>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <ShieldCheck className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium">KrushiLink Privacy Policy</h3>
            </div>

            <p className="mb-4">Last Updated: May 2023</p>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">1. Information We Collect</h4>
                <p className="text-muted-foreground text-sm">
                  We collect information you provide directly to us, such as when you create an account, 
                  update your profile, use the interactive features of our services, participate in any 
                  interactive areas of our services, request customer support, or otherwise communicate with us.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2. How We Use Information</h4>
                <p className="text-muted-foreground text-sm">
                  We use the information we collect to provide, maintain, and improve our services, 
                  such as to process transactions, send you related information, and provide technical support.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">3. Location Information</h4>
                <p className="text-muted-foreground text-sm">
                  We may collect your location information to provide location-based services, 
                  such as showing nearby tractor services and drivers. You can control access to 
                  precise location data through your device settings.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">4. Sharing of Information</h4>
                <p className="text-muted-foreground text-sm">
                  We do not share personal information with companies, organizations, or individuals 
                  outside of KrushiLink except in the following cases: with your consent, with service providers, 
                  for legal reasons, or in connection with a merger, sale, or asset transfer.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">5. Security</h4>
                <p className="text-muted-foreground text-sm">
                  We take reasonable measures to help protect information about you from loss, theft, 
                  misuse and unauthorized access, disclosure, alteration and destruction.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">6. Changes to this Policy</h4>
                <p className="text-muted-foreground text-sm">
                  We may change this Privacy Policy from time to time. If we make changes, 
                  we will notify you by revising the date at the top of the policy.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">7. Contact Us</h4>
                <p className="text-muted-foreground text-sm">
                  If you have any questions about this Privacy Policy, please contact us at: privacy@krushilink.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserContainer>
  );
};

export default PrivacyPage;
