
'use client';

import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';

// Matches the Recommendation type from the original flow
type Recommendation = {
  title: string;
  authors: string[];
  summary: string;
  url: string;
};

const hardcodedRecommendations: Recommendation[] = [
    { title: 'Gender, Sexuality, and the Politics of Writing History in the Middle East, W1', authors: ['Author 1'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'Into Africa: A Transnational History of Catholic Medical Missions and Social Change by Barbra Mann Wall, W2', authors: ['Barbra Mann Wall'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'Falling standard of undergraduate medical education in Pakistan, W3', authors: ['Author 3'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'Call for Authors, MSF Ebola reflection book « Ebola: the politics of fear », W4', authors: ['MSF'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'Charisma and History, W5', authors: ['Author 5'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'HIVstories: Living Politics', authors: ['Author 6'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'Recent Trend in the Historiography of American History: Pandemic and Roles of Historians', authors: ['Author 7'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'Regional Identity As A Constituent Element Of Upbringing At Medical Schools', authors: ['Author 8'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'Medicalizing Modern Motherhood in the Americas', authors: ['Author 9'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: '[Chris, Arie and Piet: three politically active Dutch physicians in the 20th century].', authors: ['Author 10'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'The medicalization of cousin marriage in the 19th Century: historical and philosophical approaches', authors: ['Author 11'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'THE DEPARTMENT OF HISTORY OF STATE, LAW, POLITICAL AND LEGAL DOCTRINES AND IT’S HEADS (BY THE 230TH ANNIVERSARY OF THE ESTABLISHMENT AND ACTIVITIES OF THE DEPARTMENT)', authors: ['Author 12'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'The End of Physiotherapy', authors: ['Author 13'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'Narcissism and Politics: Dreams of Glory by Jerrold M. Post', authors: ['Jerrold M. Post'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'AMERICAN CONSERVATIVES AND DOMESTIC POLITICAL STRUGGLE OVER THE ISSUE OF IMMIGRATION IN MID 1990s', authors: ['Author 15'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: "Women, Education and the Material Body Politic in Mary Wollstonecraft's Vindications.", authors: ['Mary Wollstonecraft'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'TEACHING AND LEARNING IN THE HISTORY OF MEDICINE: AN EXPERIENCE TO PROMOTE DOCUMENTARY RESEARCH THROUGH THE BIOGRAPHIES OF CADIZ DOCTORS', authors: ['Author 17'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'Global Population: History, Geopolitics, and Life on Earth by Alison Bashford', authors: ['Alison Bashford'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'Life, Liberty, [and the Pursuit of Happiness]: Medical Marijuana Regulation in Historical Context', authors: ['Author 19'], summary: 'This is an abstract.', url: 'https://google.com' },
    { title: 'Histories of sickle cell anaemia in postcolonial Britain, 1948-1997', authors: ['Author 20'], summary: 'This is an abstract.', url: 'https://google.com' },
];


function RecommendationsContent() {
  const searchParams = useSearchParams();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  const topicsParam = searchParams.get('topics');
  
  const mode = searchParams.get('mode');
  let topics: string[] = [];

  if (mode === 'group') {
    // Collect all member_* params
    searchParams.forEach((value, key) => {
      if (key.startsWith('member_')) {
        topics = topics.concat(value.split(',').map(t => t.trim()).filter(Boolean));
      }
    });
  } else {
    const topicsParam = searchParams.get('topics');
    topics = topicsParam ? topicsParam.split(',').map(t => t.trim()).filter(Boolean) : [];
  }

  
useEffect(() => {
  console.log('Topics:', topics);
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      console.log('Fetching recommendations...');
      const res = await fetch('http://127.0.0.1:5000/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests: topics, // <-- Replace with actual interests
        }),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setError(null);
    } catch (e) {
      setError('Failed to load recommendations.');
      setRecommendations([]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  fetchRecommendations();
}, [topicsParam]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center p-4 pt-20 bg-transparent">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Your Recommendations</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Here are some research papers based on your topics.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && <p className="text-center text-destructive">{error}</p>}

        {!loading && !error && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((rec, index) => (
              <a href={rec.url || 'https://google.com'} target="_blank" rel="noopener noreferrer" key={index} className="block group">
                <Card className="h-full bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-3">{rec.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">{rec.authors.join(', ')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto line-clamp-4">
                      {rec.summary || "This is an abstract."}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
         {!loading && !error && recommendations.length === 0 && (
            <p className="text-center text-muted-foreground">No recommendations found.</p>
        )}

      </div>
    </div>
  );
}

export default function RecommendationsPage() {
    return (
      <Suspense fallback={<div className="text-center p-20">Loading...</div>}>
        <RecommendationsContent />
      </Suspense>
    );
  }
