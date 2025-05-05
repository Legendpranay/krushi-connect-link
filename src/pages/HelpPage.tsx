
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, HelpCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const HelpPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const faqItems = [
    {
      question: 'How do I book a tractor service?',
      answer: 'You can book a tractor service by browsing available drivers on the map, viewing their profile, and selecting "Book Service" on their profile page.'
    },
    {
      question: 'How do I make a payment?',
      answer: 'Payments can be made through the app using various methods including UPI, credit/debit cards, or cash on completion of the service.'
    },
    {
      question: 'How do I cancel a booking?',
      answer: 'You can cancel a booking by going to the Bookings page, selecting the booking you want to cancel, and clicking on "Cancel Booking".'
    },
    {
      question: 'How do I update my profile?',
      answer: 'You can update your profile by going to the Profile page and selecting "Edit Profile".'
    },
    {
      question: 'What if the service is not completed properly?',
      answer: 'If a service is not completed to your satisfaction, please contact our support team immediately through the "Contact Us" page.'
    }
  ];

  return (
    <UserContainer>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/more')} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">{t('profile.help')}</h2>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <HelpCircle className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium">Need Additional Help?</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Our support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <Button className="w-full" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </UserContainer>
  );
};

export default HelpPage;
