
'use client';

import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type Author = {
  name: string;
  affiliation: string;
  interests: string[];
  url: string;
};

const hardcodedAuthors: Author[] = [
    { name: 'Dr. Evelyn Reed', affiliation: 'Stanford University', interests: ['Quantum Physics', 'Astrophysics'], url: 'https://google.com' },
    { name: 'Prof. Kenji Tanaka', affiliation: 'University of Tokyo', interests: ['AI Ethics', 'Robotics'], url: 'https://google.com' },
    { name: 'Dr. Maria Garcia', affiliation: 'MIT', interests: ['Bio-engineering', 'Genomics'], url: 'https://google.com' },
    { name: 'Dr. Sam Carter', affiliation: 'Caltech', interests: ['Theoretical Physics', 'String Theory'], url: 'https://google.com' },
    { name: 'Prof. Lena Petrova', affiliation: 'Moscow State University', interests: ['Organic Chemistry', 'Catalysis'], url: 'https://google.com' },
    { name: 'Dr. Ahmed Al-Jamil', affiliation: 'King Saud University', interests: ['Medieval History', 'Islamic Studies'], url: 'https://google.com' },
    { name: 'Prof. Chloe Bennet', affiliation: 'Oxford University', interests: ['Shakespearean Literature', 'Renaissance Art'], url: 'https://google.com' },
    { name: 'Dr. David Chen', affiliation: 'Peking University', interests: ['Macroeconomics', 'International Trade'], url: 'https://google.com' },
    { name: 'Dr. Emily White', affiliation: 'Harvard University', interests: ['Cognitive Neuroscience', 'Psychology'], url: 'https://google.com' },
    { name: 'Prof. Omar Badawi', affiliation: 'American University in Cairo', interests: ['Political Science', 'Middle Eastern Studies'], url: 'https://google.com' },
];


function AuthorRecommendationsContent() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthors = () => {
      setLoading(true);
      setTimeout(() => {
        try {
          setAuthors(hardcodedAuthors);
          setError(null);
        } catch (e) {
          setError('Failed to load author recommendations.');
          console.error(e);
        } finally {
          setLoading(false);
        }
      }, 500);
    };

    fetchAuthors();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center p-4 pt-20 bg-transparent">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Author Recommendations</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Here are some authors based on your topics.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && <p className="text-center text-destructive">{error}</p>}

        {!loading && !error && (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {authors.map((author, index) => (
              <a href={author.url} target="_blank" rel="noopener noreferrer" key={index} className="block group">
                <Card className="h-full bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="text-lg">{author.name}</CardTitle>
                    <CardDescription className="text-sm">{author.affiliation}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto">
                      Interests: {author.interests.join(', ')}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
         {!loading && !error && authors.length === 0 && (
            <p className="text-center text-muted-foreground">No authors found.</p>
        )}

      </div>
    </div>
  );
}

export default function AuthorRecommendationsPage() {
    return (
      <Suspense fallback={<div className="text-center p-20">Loading...</div>}>
        <AuthorRecommendationsContent />
      </Suspense>
    );
  }
