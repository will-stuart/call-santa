import { FileText, AlertCircle, CreditCard, Scale, Mail } from 'lucide-react';
import { Snowfall } from '@/components/Snowfall';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <Snowfall />
      <Header showAuthActions />
      
      <div className="relative z-10 flex-1 max-w-3xl mx-auto px-4 pt-24 pb-8 w-full">
        <div className="bg-card/90 backdrop-blur rounded-2xl p-8 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-display text-foreground">Terms of Service</h1>
          </div>
          
          <p className="text-muted-foreground mb-8 font-body">
            Last updated: December 2025
          </p>

          <div className="space-y-8 text-foreground font-body">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-display mb-3">Welcome to Call Santa</h2>
              <p className="text-muted-foreground leading-relaxed">
                By using Call Santa, you agree to these terms. Please read them carefully. 
                Call Santa provides an AI-powered voice experience that allows children to 
                have personalized conversations with Santa Claus.
              </p>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-xl font-display mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Eligibility
              </h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li>You must be 18 years or older to create an account</li>
                <li>By creating an account, you confirm you are the parent or legal guardian of any children who will use the service</li>
                <li>You are responsible for supervising your children's use of the service</li>
              </ul>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-xl font-display mb-3">Service Description</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Call Santa is an entertainment service that uses AI technology to simulate 
                conversations with Santa Claus. The service:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li>Is intended for entertainment purposes only</li>
                <li>Uses information you provide to personalize conversations</li>
                <li>Does not retain voice conversation data (zero-retention policy)</li>
                <li>Is not affiliated with any official Santa Claus entity</li>
              </ul>
            </section>

            {/* Subscription & Payment */}
            <section className="bg-secondary/50 rounded-xl p-6 border border-border">
              <h2 className="text-xl font-display mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Subscription & Payment
              </h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li><strong>Free Plan:</strong> Limited calls and minutes per account</li>
                <li><strong>Season Pass:</strong> Monthly subscription with increased call and minute limits</li>
                <li>Current pricing and plan details are available on our website</li>
                <li>Payments are processed securely through Stripe</li>
                <li>You may cancel your subscription at any time from the Settings page - your access continues until the end of your current billing period</li>
                <li><strong>No refunds:</strong> When you cancel, you retain access until the end of your paid period but will not be refunded for unused time</li>
              </ul>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-xl font-display mb-3 flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Acceptable Use
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to manipulate or abuse the AI system</li>
                <li>Share your account credentials with others</li>
                <li>Use automated systems to access the service</li>
                <li>Reverse engineer or attempt to extract the AI model</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-display mb-3">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                Call Santa is provided "as is" without warranties of any kind. We are not liable 
                for any indirect, incidental, or consequential damages arising from your use of 
                the service. Our total liability is limited to the amount you paid for the service 
                in the past 12 months.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-xl font-display mb-3">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these terms from time to time. We will notify you of significant 
                changes by email or through the service. Continued use after changes constitutes 
                acceptance of the new terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-display mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about these terms, please contact us at northpole@callsanta.app
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
