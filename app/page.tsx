import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare, Users, Shield, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">E</span>
          </div>
          <span className="text-lg font-bold text-foreground">EchoVerse</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
            Your space to talk, share, and connect
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
            EchoVerse is a modern communication platform built for communities.
            Create servers, chat in real-time, and build meaningful connections with people who share your interests.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Create an Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-24 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<MessageSquare className="h-6 w-6" />}
            title="Real-time Chat"
            description="Send messages instantly with live updates across all your channels."
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Community Servers"
            description="Create and join servers for any topic, hobby, or group."
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6" />}
            title="Role System"
            description="Fine-grained permissions and roles to manage your community."
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Direct Messages"
            description="Private conversations with friends, one-on-one or in groups."
          />
        </div>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        EchoVerse. Built for communities.
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
