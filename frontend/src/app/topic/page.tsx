
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, UserPlus, UserMinus, Search } from 'lucide-react';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

type Member = {
  id: number;
  name: string;
  topics: string[];
};

function TopicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'individual';
  const type = searchParams.get('type') || 'work';

  const [topic, setTopic] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: 'Member 1', topics: [] },
    { id: 2, name: 'Member 2', topics: [] },
  ]);
  const [activeMemberId, setActiveMemberId] = useState<number | null>(
    mode === 'group' ? 1 : null
  );


  const placeholders = [
    "What's your favorite movie genre?",
    "Let's talk about travel destinations",
    "Suggest some good sci-fi books",
    "I'm looking for a new recipe",
    "What's the best way to learn a new language?",
  ];

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() === '') return;

    if (mode === 'individual') {
      if (!topics.includes(topic.trim())) {
        setTopics([...topics, topic.trim()]);
      }
    } else {
      if (activeMemberId) {
        setMembers(members.map(member =>
          member.id === activeMemberId && !member.topics.includes(topic.trim())
            ? { ...member, topics: [...member.topics, topic.trim()] }
            : member
        ));
      }
    }
    setTopic('');
  };

  const handleRemoveTopic = (topicToRemove: string, memberId?: number) => {
    if (mode === 'individual') {
      setTopics(topics.filter(t => t !== topicToRemove));
    } else {
      setMembers(members.map(member =>
        member.id === memberId
          ? { ...member, topics: member.topics.filter(t => t !== topicToRemove) }
          : member
      ));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };
  
  const addMember = () => {
    if (members.length < 5) {
      const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
      setMembers([...members, { id: newId, name: `Member ${newId}`, topics: [] }]);
    }
  };

  const removeMember = () => {
    if (members.length > 2) {
      const memberToRemove = members[members.length - 1];
      if (activeMemberId === memberToRemove.id) {
        setActiveMemberId(members[0].id);
      }
      setMembers(members.slice(0, -1));
    }
  };

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    queryParams.set('mode', mode);

    if (mode === 'individual') {
      queryParams.set('topics', topics.join(','));
    } else {
       members.forEach(member => {
        queryParams.append(`member_${member.id}`, member.topics.join(','));
       });
    }

    const destination = type === 'author' ? '/author-recommendations' : '/recommendations';
    
    router.push(`${destination}?${queryParams.toString()}`);
  };

  const isSearchDisabled = () => {
    if (mode === 'individual') {
      return topics.length === 0;
    } else {
      return members.every(member => member.topics.length === 0);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center p-4 pt-20 bg-transparent">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10 animate-in fade-in-0 duration-500">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">What's on your mind?</h1>
          <p className="mt-4 text-lg text-muted-foreground">Add topics to get your recommendations.</p>
        </div>

        <div className="mb-8 animate-in fade-in-0 slide-in-from-bottom-10 duration-700">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleInputChange}
            onSubmit={handleAddTopic}
            value={topic}
          />
        </div>

        {mode === 'group' && (
           <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-2xl font-semibold">Members</h2>
               <div className="flex gap-2">
                 <Button variant="outline" size="icon" onClick={addMember} disabled={members.length >= 5} aria-label="Add Member">
                   <UserPlus className="h-4 w-4" />
                 </Button>
                 <Button variant="outline" size="icon" onClick={removeMember} disabled={members.length <= 2} aria-label="Remove Member">
                   <UserMinus className="h-4 w-4" />
                 </Button>
               </div>
            </div>
             <div className="flex flex-wrap gap-2 mb-4">
               {members.map(member => (
                 <Button
                   key={member.id}
                   variant={activeMemberId === member.id ? 'default' : 'outline'}
                   onClick={() => setActiveMemberId(member.id)}
                 >
                   {member.name}
                 </Button>
               ))}
             </div>
             {members.map(member => (
                activeMemberId === member.id && (
                  <div key={member.id} className="space-y-4">
                     {member.topics.map((t, index) => (
                      <div 
                        key={t}
                        className="relative p-2 rounded-lg animate-in fade-in-0 zoom-in-95 duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                         <div
                           style={{
                             position: 'absolute',
                             top: 0,
                             left: 0,
                             width: '100%',
                             height: '100%',
                             borderRadius: '0.5rem',
                             border: '1px dashed hsl(var(--primary))',
                             opacity: 0.5,
                           }}
                         />
                         <div className="flex items-center justify-between relative z-10">
                           <span className="font-medium text-foreground px-2">{t}</span>
                           <Button variant="ghost" size="icon" onClick={() => handleRemoveTopic(t, member.id)} aria-label={`Remove ${t}`}>
                             <X className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                           </Button>
                         </div>
                       </div>
                    ))}
                    {member.topics.length === 0 && (
                      <div className="relative text-center py-4 px-4 rounded-lg animate-in fade-in-0 duration-500 [animation-delay:500ms]"
                        style={{
                          border: '2px dashed hsl(var(--border))'
                        }}
                      >
                          <p className="text-muted-foreground relative z-10">{member.name}'s topics will appear here.</p>
                      </div>
                    )}
                  </div>
                )
             ))}
           </div>
        )}

        {mode === 'individual' && (
          <div className="space-y-4">
            {topics.map((t, index) => (
              <div 
                key={t}
                className="relative p-2 rounded-lg animate-in fade-in-0 zoom-in-95 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '0.5rem',
                    border: '1px dashed hsl(var(--primary))',
                    opacity: 0.5,
                  }}
                />
                <div className="flex items-center justify-between relative z-10">
                  <span className="font-medium text-foreground px-2">{t}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveTopic(t)} aria-label={`Remove ${t}`}>
                    <X className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                  </Button>
                </div>
              </div>
            ))}
            {topics.length === 0 && (
              <div className="relative text-center py-4 px-4 rounded-lg animate-in fade-in-0 duration-500 [animation-delay:500ms]"
                style={{
                  border: '2px dashed hsl(var(--border))'
                }}
              >
                  <p className="text-muted-foreground relative z-10">Your topics will appear here.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 flex justify-center animate-in fade-in-0 slide-in-from-bottom-10 duration-700 [animation-delay:400ms]">
          <Button size="lg" onClick={handleSearch} disabled={isSearchDisabled()}>
            <Search className="mr-2 h-5 w-5" />
            Get Recommendations
          </Button>
        </div>
      </div>
    </div>
  );
}


export default function TopicPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TopicContent />
    </Suspense>
  );
}
