
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type Author = {
  name: string;
  id: string;
  affiliation: string;
  hIndex: number;
  i10Index: number;
  interests: string[];
  url: string;
};




const API_URL = "https://b8cde27ab0fd.ngrok-free.app";
// const API_URL = "http://127.0.0.1:7006";
// fetch(`${API_URL}/your-backend-route`, ...)


function AuthorRecommendationsContent() {
  const searchParams = useSearchParams();
  const institution = searchParams.get('institution') || '';
  const topics = searchParams.get('topics') || '';

  // const [institution, setInstitution] = useState('');
  // const [topics, setTopics] = useState('');
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    console.log()
  fetchAuthors();
}, [institution, topics]);

   const fetchAuthors = async () => {
    
  setLoading(true);
  setError(null);
  try {
    const res = await fetch(`${API_URL}/author-topic-recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topics, // array of topics
        institution, // array of institutions (optional)
      }),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    setAuthors(data.recommendations || []);
  } catch (e) {
    setError('Failed to load author recommendations.');
    setAuthors([]);
    console.error(e);
  } finally {
    setLoading(false);
  }
};

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
      <a
        href={`https://openalex.org/authors/${author.id}`}
        target="_blank"
        rel="noopener noreferrer"
        key={index}
        className="block group"
      >
        <Card className="h-full bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="text-lg">{author.name}</CardTitle>
            <CardDescription className="text-sm">{author.affiliation}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              <div>h-index: {author.hIndex ?? 'N/A'}</div>
              <div>i10-index: {author.i10Index ?? 'N/A'}</div>
            </div>
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
