import { Shield, Lock, Eye, Trash2, Baby } from 'lucide-react';
import { Snowfall } from '@/components/Snowfall';
import Header from '@/components/Header';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />
      <Header showAuthActions />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-8">
        <div className="bg-card/90 backdrop-blur rounded-2xl p-8 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-display text-foreground">Privacy Policy</h1>
          </div>
          
          <p className="text-muted-foreground mb-8 font-body">
            Last updated: December 2024
          </p>

          <div className="space-y-8 text-foreground font-body">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-display mb-3 flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Our Commitment to Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Call Santa is committed to protecting the privacy of our users, especially children. 
                We understand that you're sharing personal information about your family to create 
                magical experiences, and we take that responsibility seriously.
              </p>
            </section>

            {/* Data Collection */}
            <section>
              <h2 className="text-xl font-display mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                What Data We Collect
              </h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li><strong>Account Information:</strong> Email address and password for authentication</li>
                <li><strong>Knowledge Entries:</strong> Names and contextual information you provide about family members</li>
                <li><strong>Usage Data:</strong> Call counts and duration for managing your subscription limits</li>
              </ul>
            </section>

            {/* Zero Retention */}
            <section className="bg-primary/10 rounded-xl p-6 border border-primary/20">
              <h2 className="text-xl font-display mb-3 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Zero-Retention Voice Calls
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong className="text-foreground">We do not store or retain any voice conversation data.</strong>
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li>Voice conversations are processed in real-time and immediately discarded</li>
                <li>No audio recordings are saved or stored</li>
                <li>Conversation transcripts are not retained</li>
                <li>Our AI partner (ElevenLabs) is configured for zero data retention</li>
              </ul>
            </section>

            {/* AI Training */}
            <section>
              <h2 className="text-xl font-display mb-3">Your Data Is Never Used for AI Training</h2>
              <p className="text-muted-foreground leading-relaxed">
                We have configured our AI voice partner to explicitly exclude all user data from 
                model training. Your children's names, interests, wishes, and conversation content 
                are <strong>never</strong> used to train or improve AI models.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="bg-secondary/50 rounded-xl p-6 border border-border">
              <h2 className="text-xl font-display mb-3 flex items-center gap-2">
                <Baby className="h-5 w-5 text-primary" />
                Children's Privacy (COPPA Compliance)
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Call Santa is designed to be operated by parents/guardians on behalf of their children.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li>We do not collect personal information directly from children</li>
                <li>Parents control all information shared about their children</li>
                <li>Parents can delete their children's information at any time</li>
                <li>We do not share children's information with third parties for marketing</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-xl font-display mb-3">How We Share Data</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We share limited data only with essential service providers:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li><strong>ElevenLabs:</strong> Receives knowledge context during calls to personalize 
                  Santa's responses. Configured for zero retention—no data is stored.</li>
                <li><strong>Stripe:</strong> Processes payments securely. We never see your full card details.</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-xl font-display mb-3">Data Security</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li>All data is encrypted in transit (HTTPS) and at rest</li>
                <li>Row-level security ensures you can only access your own data</li>
                <li>Password protection with leaked credential detection</li>
                <li>Regular security audits of our infrastructure</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-display mb-3">Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li>Access all data we hold about you</li>
                <li>Delete your account and all associated data</li>
                <li>Export your data</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise these rights, visit the Settings page or contact us.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-display mb-3">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this privacy policy or our data practices, 
                please contact us at privacy@callsanta.app
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
