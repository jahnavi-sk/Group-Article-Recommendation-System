'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogOut, Trash2, ArrowLeft, Loader2, FileText, ExternalLink } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = "https://b8cde27ab0fd.ngrok-free.app";

function AccountViewContent() {
  const [user, setUser] = useState<{ name: string; email: string; member_since: string; account_type: string; liked_works?: any[]; interests?: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<'logout' | 'delete' | 'delete_final' | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/recommendation-type';
  const [deleteBtnMoveCount, setDeleteBtnMoveCount] = useState(0);
  const [deleteBtnStyle, setDeleteBtnStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || localStorage.getItem('email');
    if (!email) {
      setLoading(false);
      // Optional: Redirect to login if not found
      // router.push('/'); 
      return;
    }

    fetch(`${API_URL}/get-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setUser(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch profile", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (confirmAction !== 'delete_final') {
      setDeleteBtnMoveCount(0);
      setDeleteBtnStyle({});
    }
  }, [confirmAction]);

  const moveDeleteButton = () => {
    if (deleteBtnMoveCount < 3) {
      const x = Math.max(20, Math.random() * (window.innerWidth - 200));
      const y = Math.max(20, Math.random() * (window.innerHeight - 100));
      setDeleteBtnStyle({
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        transition: 'all 0.3s ease-out',
        zIndex: 100,
      });
      setDeleteBtnMoveCount((prev) => prev + 1);
    }
  };

  const performLogout = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  const performDelete = async () => {
    const email = localStorage.getItem('userEmail') || localStorage.getItem('email');
    if (!email) return;

    await fetch(`${API_URL}/delete-account`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    localStorage.removeItem('email');
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  return (
    <main className="relative min-h-screen w-full bg-[#030303] text-foreground flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Grid matching Home */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="absolute top-8 left-8 z-20 animate-in fade-in-0 duration-500">
        <Link href={returnTo} className="flex items-center text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="relative z-10 mb-8 text-center animate-in fade-in-0 duration-500">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-2">Account View</h1>
        <p className="text-lg text-muted-foreground">Manage your profile and settings.</p>
      </div>

      <Card className="relative z-10 w-full max-w-2xl animate-in fade-in-0 slide-in-from-bottom-10 duration-700 bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl">
        <CardHeader className="flex flex-col items-center text-center pb-6">
          <CardTitle className="text-2xl font-semibold">{user?.name || 'Guest User'}</CardTitle>
          <CardDescription className="mt-1">{user?.email || 'guest@example.com'}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-white/5 p-4 bg-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Member Since</span>
                  <span className="text-sm text-muted-foreground">{user?.member_since || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-primary" />
                  Liked Papers
                </h3>
                <div className="rounded-lg border border-white/5 bg-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {user?.liked_works && user.liked_works.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {user.liked_works.map((work: any, i: number) => (
                        <div key={i} className="p-4 hover:bg-white/5 transition-colors">
                          <a href={`https://openalex.org/works/${work.id}`} target="_blank" rel="noopener noreferrer" className="group">
                            <h4 className="text-sm font-medium group-hover:text-primary transition-colors flex items-start gap-2">
                              {work.title} <ExternalLink className="h-3 w-3 opacity-50 mt-1" />
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{work.summary || 'No abstract available.'}</p>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      You haven't liked any papers yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button variant="secondary" onClick={() => setConfirmAction('logout')} className="w-full justify-start h-11 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
          <Button variant="destructive" onClick={() => setConfirmAction('delete')} className="w-full justify-start h-11 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 hover:border-red-500/40 transition-colors">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </CardFooter>
      </Card>

      {/* Logout Confirmation Modal */}
      {confirmAction === 'logout' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-primary/20 bg-[#080808] p-6 shadow-2xl shadow-primary/10">
            <h3 className="text-xl font-semibold text-primary mb-2">Log Out</h3>
            <p className="text-muted-foreground mb-6">Are you sure you want to log out? </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setConfirmAction(null)} className="hover:bg-white/5">Cancel</Button>
              <Button 
                className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20"
                onClick={performLogout}
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Step 1 */}
      {confirmAction === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-[#080808] p-6 shadow-2xl shadow-red-500/10">
            <h3 className="text-xl font-semibold text-red-500 mb-2">Delete Account</h3>
            <p className="text-muted-foreground mb-6"> Are you absolutely sure? This will permanently delete your account and all associated data.</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setConfirmAction(null)} className="hover:bg-white/5">Cancel</Button>
              <Button 
                className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20"
                onClick={() => setConfirmAction('delete_final')}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Step 2 */}
      {confirmAction === 'delete_final' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-[#080808] p-6 shadow-2xl shadow-red-500/10">
            <h3 className="text-xl font-semibold text-red-500 mb-2">Final Confirmation</h3>
            <p className="text-muted-foreground mb-6">LAST CHANCE! This action cannot be undone. Still want to proceed?</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setConfirmAction(null)} className="hover:bg-white/5">Cancel</Button>
              <Button 
                className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20"
                onClick={(e) => {
                  if (deleteBtnMoveCount < 3) {
                    e.preventDefault();
                    moveDeleteButton();
                  } else {
                    performDelete();
                  }
                }}
                onMouseEnter={moveDeleteButton}
                style={deleteBtnStyle}
              >
                Delete Forever
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AccountViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#030303] text-white">Loading...</div>}>
      <AccountViewContent />
    </Suspense>
  );
}
