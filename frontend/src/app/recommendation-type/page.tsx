
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Book, User } from 'lucide-react';

export default function RecommendationTypePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-transparent">
      <div className="mb-12 text-center animate-in fade-in-0 duration-500">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">What Are You Looking For?</h1>
        <p className="mt-4 text-lg text-muted-foreground">Choose a recommendation type.</p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-3xl w-full">
        <Link href="/mode?type=work" className="animate-in fade-in-0 slide-in-from-bottom-10 duration-700">
          <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-col items-center justify-center p-8 text-center">
              <Book className="h-16 w-16 mb-4 text-primary" />
              <CardTitle className="text-2xl font-semibold">Works</CardTitle>
              <CardDescription className="mt-2">Get research paper recommendations.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/mode?type=author" className="animate-in fade-in-0 slide-in-from-bottom-10 duration-700 [animation-delay:200ms]">
          <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-col items-center justify-center p-8 text-center">
              <User className="h-16 w-16 mb-4" style={{color: 'hsl(var(--accent))'}}/>
              <CardTitle className="text-2xl font-semibold">Authors</CardTitle>
              <CardDescription className="mt-2">Find authors based on your interests.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
