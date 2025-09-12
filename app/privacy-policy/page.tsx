'use client'

import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { BackButton } from "@/components/back-button"
import { Shield, Database, Eye, Lock, Mail, Calendar } from "lucide-react"

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 13, 2025"
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 pt-12 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground">How we protect your fitness data</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-primary mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Your Privacy Matters</h2>
                <p className="text-muted-foreground">
                  FitTracker is designed with privacy-first principles. All your workout data stays on your device. 
                  We don't collect, store, or share your personal fitness information.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Last updated: {lastUpdated}
                </p>
              </div>
            </div>
          </Card>

          {/* Key Points */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <Database className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Local Storage Only</h3>
              <p className="text-sm text-muted-foreground">All data stored on your device</p>
            </Card>
            <Card className="p-4 text-center">
              <Eye className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">No Tracking</h3>
              <p className="text-sm text-muted-foreground">We don't track your activities</p>
            </Card>
            <Card className="p-4 text-center">
              <Lock className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">No Data Sharing</h3>
              <p className="text-sm text-muted-foreground">Your data stays private</p>
            </Card>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Workout Data</h3>
                  <p>When you use FitTracker, we store the following information locally on your device:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>Exercise names and details</li>
                    <li>Sets, reps, and weight information</li>
                    <li>Workout duration and dates</li>
                    <li>Personal records and achievements</li>
                    <li>Body measurements (if you choose to track them)</li>
                    <li>Goals and progress data</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Device Information</h3>
                  <p>We may collect basic device information for app functionality:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>Device type and operating system version</li>
                    <li>App version and crash reports (anonymous)</li>
                    <li>Theme preferences (light/dark mode)</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Your workout and fitness data is used exclusively to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Display your workout history and progress</li>
                  <li>Calculate statistics and analytics</li>
                  <li>Track your fitness goals and achievements</li>
                  <li>Provide personalized workout recommendations</li>
                  <li>Enable data export functionality</li>
                </ul>
                <p className="font-medium text-foreground">
                  Important: All processing happens locally on your device. We never send your workout data to external servers.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Data Storage and Security</h2>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Local Storage</h3>
                  <p>
                    All your fitness data is stored locally in your device's browser storage or app data folder. 
                    This means your information never leaves your device unless you explicitly export it.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Data Security</h3>
                  <p>Your data is protected by:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>Device-level security (screen lock, device encryption)</li>
                    <li>App sandboxing provided by your operating system</li>
                    <li>No network transmission of personal data</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Data Sharing and Third Parties</h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="font-medium text-foreground">
                  We do not share, sell, or transmit your personal fitness data to any third parties.
                </p>
                <div>
                  <h3 className="font-medium text-foreground mb-2">No Analytics or Tracking</h3>
                  <p>FitTracker does not use:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>Google Analytics or similar tracking services</li>
                    <li>Social media tracking pixels</li>
                    <li>Advertising networks</li>
                    <li>User behavior analytics</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">App Store Compliance</h3>
                  <p>
                    When downloaded through app stores (Google Play, etc.), basic installation and 
                    crash reporting data may be collected by the platform, but this does not include 
                    your workout or personal data.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Your Rights and Controls</h2>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Data Control</h3>
                  <p>You have complete control over your data:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li><strong>Export:</strong> Download all your data anytime using the Export feature</li>
                    <li><strong>Delete:</strong> Clear all data by uninstalling the app or clearing app data</li>
                    <li><strong>Modify:</strong> Edit or delete individual workouts and measurements</li>
                    <li><strong>Backup:</strong> Create backups using the export functionality</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Data Portability</h3>
                  <p>
                    Your exported data is in standard JSON format, making it easy to import into other 
                    fitness apps or use for your own analysis.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Children's Privacy</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  FitTracker is designed for users aged 13 and older. We do not knowingly collect 
                  personal information from children under 13. If you are a parent or guardian and 
                  believe your child has provided us with personal information, please contact us.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Changes to This Policy</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  We may update this privacy policy from time to time. Any changes will be reflected 
                  in the "Last updated" date at the top of this policy. Continued use of FitTracker 
                  after changes constitutes acceptance of the new policy.
                </p>
                <p>
                  Major changes to data handling practices will be communicated through the app 
                  or website before taking effect.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">8. Contact Information</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  If you have any questions about this privacy policy or FitTracker's data practices, 
                  please contact us:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">Email:</span>
                  </div>
                  <p>privacy@fittracker.app</p>
                  
                  <div className="flex items-center gap-2 mt-4 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">Response Time:</span>
                  </div>
                  <p>We aim to respond to all privacy inquiries within 48 hours.</p>
                </div>
              </div>
            </Card>

            {/* Footer Summary */}
            <Card className="p-6 bg-muted/50">
              <h2 className="text-lg font-semibold text-foreground mb-3">Summary</h2>
              <p className="text-muted-foreground">
                FitTracker is built with privacy as a core principle. Your workout data stays on your device, 
                under your complete control. We don't track you, share your data, or require cloud storage. 
                Your fitness journey is yours alone.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
