
'use client';

import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import { Heart } from 'lucide-react';

// Matches the Recommendation type from the original flow
type Author = {
  name: string;
  id: string;
};

type Recommendation = {
  id: string;
  title: string;
  authors: Author[];
  summary: string;
  url: string;
  liked?: boolean;
  likes: number;
  date: string;
};


// const API_URL = "https://bc0211fc54fa.ngrok-free.app";
const API_URL = "https://b8cde27ab0fd.ngrok-free.app";

// const API_URL = "http://127.0.0.1:7006";

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cbfLoading, setCbfLoading] = useState(false); // for similar user works
  const [error, setError] = useState<string | null>(null);
  const [showAuthors, setShowAuthors] = useState(false);
  const [showCBF, setShowCBF] = useState(false);
  const [cbfRecommendations, setCbfRecommendations] = useState<Recommendation[]>([]);

  const [showDialog, setShowDialog] = useState(false);
  const [problemStatement, setProblemStatement] = useState<string | null>(null);
  const [problemLoading, setProblemLoading] = useState(false);
  const [likedRecommendations, setLikedRecommendations] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState<string>('');


  const [showAbstractDialog, setShowAbstractDialog] = useState(false);
  const [activeAbstract, setActiveAbstract] = useState<string | null>(null);
  // const email = searchParams.get('email') || localStorage.getItem('userEmail') || '';


  const [sortByYear, setSortByYear] = useState(false);
  const [originalRecommendations, setOriginalRecommendations] = useState<Recommendation[]>([]);
  
  
  const mode = searchParams.get('mode');
  let topics: string[] = [];

  const toggleLike = (workId: string) => {
  setLikedRecommendations(prev => {
    const newLiked = new Set(prev);
    if (newLiked.has(workId)) {
      newLiked.delete(workId);
    } else {
      newLiked.add(workId);
    }
    return newLiked;
  });
};




  const handleLike = async (workId: string, index: number) => {
  // const email = localStorage.getItem('userEmail');
  console.log('User email 2:', email);
  if (!email) return alert("Please log in to like works");

  const res = await fetch(`${API_URL}/like-work`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workId, email }),
  });
  const data = await res.json();

    
  if (data.action === 'liked') {
    setLikedRecommendations(prev => new Set(prev).add(workId));
  } else if (data.action === 'unliked') {
    setLikedRecommendations(prev => {
      const newSet = new Set(prev);
      newSet.delete(workId);
      return newSet;
    });
  }
};

  const authorMap = new Map<string, Author>();
    recommendations.forEach(rec => {
      rec.authors.forEach(author => {
        if (author.id && !authorMap.has(author.id)) {
          authorMap.set(author.id, author);
        }
      });
    });
  const authorList = Array.from(authorMap.values());


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
  


  const fetchSimilarUserWorks = async () => {
  if (!email) return alert("Please log in first!");
  console.log("Fetching similar user works for email:", email);
  setCbfLoading(true);
  try {
    const res = await fetch(`${API_URL}/similar-user-works`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    console.log("Received similar user works data:", data);
    setCbfRecommendations(data.recommendations || []);
  } catch (err) {
    console.error(err);
    setError("Failed to fetch similar user recommendations.");
  } finally {
    setCbfLoading(false);
  }
};

const handleSortByYear = () => {
  setSortByYear(prev => {
    if (!prev) {
      setRecommendations(prevRecs =>
        [...prevRecs].sort((a, b) => {
          // Use getTime if date is a full date string, fallback to Number if it's just a year
          const aTime = a.date ? new Date(a.date).getTime() : 0;
          const bTime = b.date ? new Date(b.date).getTime() : 0;
          return bTime - aTime;
        })
      );
    } else {
      setRecommendations(originalRecommendations);
    }
    return !prev;
  });
};

useEffect(() => {
  
  const interval = setInterval(() => {
    console.log('loading:', loading);
  }, 1000);
  return () => clearInterval(interval);
}, [loading]);

useEffect(() => {
  // This code runs only in the browser
  
  const paramsEmail = searchParams.get('email');
  const storageEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : '';
  setEmail(paramsEmail || storageEmail || '');
}, [searchParams]);

useEffect(() => {
    if (recommendations.length >= 5 && problemStatement === null) {
      const abstracts = recommendations.slice(0, 5).map(r => r.summary || '').filter(Boolean);
      if (abstracts.length === 5) {
        setProblemLoading(true);
        fetch(`${API_URL}/problem-statement`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ abstracts }),
        })
          .then(res => res.json())
          .then(data => setProblemStatement(data.problem_statement))
          .catch(() => {setProblemStatement('Could not generate problem statement.'); console.log("Error generating problem statement", abstracts);})
          .finally(() => setProblemLoading(false));
      }
    }
  }, [recommendations, problemStatement]);

useEffect(() => {
  if (email) {
    console.log('Email changed, fetching similar user works for:', email);
    fetchSimilarUserWorks();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [email]);

useEffect(() => {
  if(!email) return;
  console.log('User email:', email);
  console.log('Topics:', topics);

  let fetchBody: any = { mode, email };
  console.log('Fetch body before mode check:', fetchBody);

  if (mode === 'group') {
    // Reconstruct members array from searchParams
    const memberIds = Array.from(searchParams.keys())
      .filter(key => key.startsWith('member_') && !key.endsWith('_institution'))
      .map(key => key.split('_')[1])
      .filter((v, i, a) => a.indexOf(v) === i); // unique

    fetchBody.members = memberIds.map(id => ({
      topics: (searchParams.get(`member_${id}`) || '').split(',').map(t => t.trim()).filter(Boolean),
      institution: searchParams.get(`member_${id}_institution`) || ''
    }));
  } else {
    fetchBody.interests = topics;
  }

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      console.log('Fetching recommendations...');
      const res = await fetch(`${API_URL}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({
        //   interests: topics, // <-- Replace with actual interests
        //   mode,
        //   email,
        // }),
        body: JSON.stringify(fetchBody),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      console.log('hi')
      console.log('Received data:', data);
      setRecommendations(data.recommendations || []);
      setOriginalRecommendations(data.recommendations || []);
      setLikedRecommendations(
  new Set(
    (data.recommendations || [])
      .filter((r: any) => r.liked)
      .map((r: any) => r.id)
  )
);
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
// }, [topicsParam]);
}, [searchParams.toString(),email]);



return (
  <div className="flex min-h-screen w-full flex-col items-center p-4 pt-20 bg-transparent">

    {showAbstractDialog && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
      <button
        className="absolute top-4 right-4 text-2xl font-bold hover:text-destructive transition"
        onClick={() => setShowAbstractDialog(false)}
        aria-label="Close"
      >
        ×
      </button>
      <h2 className="text-xl font-bold mb-4 pr-8">Full Abstract</h2>
      <div className="prose dark:prose-invert max-w-none">
        <p className="whitespace-pre-line text-base leading-relaxed">{activeAbstract}</p>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition"
          onClick={() => setShowAbstractDialog(false)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    {/* Problem Statement Dialog */}
    <button
      className="text-base md:text-lg mb-8 text-white font-normal inter-var text-center hover:underline"
      onClick={() => setShowDialog(true)}
    >
      Want to get a problem statement based on some of these abstracts ?
    </button>
      

    <button
  className="absolute top-10 right-0 m-4 px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary/80 transition"
  onClick={handleSortByYear}
>
  {sortByYear ? "Original Order" : "Sort by Year"}
</button>
    
    {showDialog && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto relative">
          <button
            className="absolute top-4 right-4 text-2xl font-bold hover:text-destructive transition"
            onClick={() => setShowDialog(false)}
            aria-label="Close"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold mb-4 pr-8">Recommended Problem Statement</h2>
          {problemLoading && (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Generating problem statement...</p>
            </div>
          )}
          {!problemLoading && problemStatement && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-line text-sm leading-relaxed">{problemStatement}</p>
            </div>
          )}
          {!problemLoading && !problemStatement && (
            <p className="text-muted-foreground text-center py-8">No problem statement available.</p>
          )}
          <div className="mt-6 flex justify-end">
            <button
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition"
              onClick={() => setShowDialog(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="w-full max-w-7xl relative">
      {/* Top Buttons */}
      <button
        className="absolute top-0 right-0 m-4 px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary/80 transition"
        onClick={() => setShowAuthors(!showAuthors)}
      >
        {showAuthors ? "Show Papers" : "Authors"}
      </button>
      
      <button
        className="absolute top-0 left-0 m-4 px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary/80 transition"
        onClick={() => setShowCBF(prev => !prev)}
        disabled={cbfLoading}
      >
        {showCBF ? "Show My Papers" : "Check out what similar users have liked!"}
      </button>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {showAuthors ? "Recommended Authors" : "Your Recommendations"}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {showAuthors
            ? "Authors from recommended papers for your topics."
            : "Here are some research papers based on your topics."}
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm animate-pulse">
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

      {/* Error */}
      {error && <p className="text-center text-destructive">{error}</p>}

      {/* No Recommendations */}
      {!loading && !error && !showCBF && recommendations.length === 0 && (
        <p className="text-center text-muted-foreground">No recommendations found.</p>
      )}
      {!loading && !error && showCBF && !cbfLoading && cbfRecommendations.length === 0 && (
        <p className="text-center text-muted-foreground">No similar-user recommendations found.</p>
      )}

      {/* CBF Loading */}
      {showCBF && cbfLoading && (
        <div className="text-center py-8">Loading what similar users liked...</div>
      )}

      {/* Main Recommendations Grid */}
      {!loading && !error && !showAuthors && !showCBF && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendations.map((rec, index) => (
            <div key={index} className="relative">
              {/* Like button */}
              <button
  onClick={e => {
    e.preventDefault();
    handleLike(rec.id, index);
  }}
  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-neutral-700 transition"
  aria-label={likedRecommendations.has(rec.id) ? "Unlike" : "Like"}
>
  <Heart
    size={20}
    className={`transition ${
      likedRecommendations.has(rec.id)
        ? 'fill-red-500 stroke-red-500'
        : 'stroke-neutral-600 dark:stroke-neutral-400'
    }`}
  />
</button>
<button
  className="mt-2 px-3 py-1 bg-black text-white rounded hover:bg-primary/80 transition"
  onClick={e => {
    e.preventDefault();
    setActiveAbstract(rec.summary || "No abstract available.");
    setShowAbstractDialog(true);
  }}
>
  Read Full Abstract
</button>
              {/* Card */}
              <a href={rec.url || '#'} target="_blank" rel="noopener noreferrer" className="block group">
                <Card className="h-full bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-3">{rec.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {rec.authors.map(a => a.name).join(', ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto line-clamp-4">
                      {rec.summary || "This is an abstract."}
                    </p>
                  </CardContent>
                </Card>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Authors Grid */}
      {!loading && !error && showAuthors && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {authorList.map(author => (
            <a
              key={author.id}
              href={`https://openalex.org/authors/${author.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{author.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">View profile on OpenAlex</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}

      {/* CBF Recommendations Grid */}
      {!loading && !error && showCBF && !cbfLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cbfRecommendations.map((rec, index) => (
            <a key={rec.id} href={rec.url || '#'} target="_blank" rel="noopener noreferrer" className="block group">
              <Card className="h-full bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-3">{rec.title}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {rec.authors.map(a => a.name).join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-4">{rec.summary}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
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
