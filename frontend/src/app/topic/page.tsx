
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, UserPlus, UserMinus, Search } from 'lucide-react';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input'; 
import { Suspense } from 'react';


type Member = {
  id: number;
  name: string;
  topics: string[];
  institution: string;
};


function TopicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'individual';
  const type = searchParams.get('type') || 'work';
  const [institution, setInstitution] = useState('');
  const [topic, setTopic] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: 'Member 1', topics: [], institution: '' },
    { id: 2, name: 'Member 2', topics: [], institution: '' },
  ]);
  const [activeMemberId, setActiveMemberId] = useState<number | null>(
    mode === 'group' ? 1 : null
  );

  const placeholders = [
    "What's your research interest?",
    "Enter a topic of interest",
    "What field are you exploring?",
    "Add your area of study",
    "What topics interest you?",
  ];

  const addInstitutionToMember = (memberId: number, institution: string) => {
    setMembers(prevMembers =>
      prevMembers.map(m =>
        m.id === memberId ? { ...m, institution } : m
      )
    );
  };

  const addTopicToMember = (memberId: number, topic: string) => {
    setMembers(prevMembers =>
      prevMembers.map(m =>
        m.id === memberId && !m.topics.includes(topic)
          ? { ...m, topics: [...m.topics, topic] }
          : m
      )
    );
  };

  const removeTopicFromMember = (memberId: number, topicIndex: number) => {
    setMembers(prevMembers =>
      prevMembers.map(m =>
        m.id === memberId
          ? { ...m, topics: m.topics.filter((_, idx) => idx !== topicIndex) }
          : m
      )
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() === '') return;

    if (mode === 'individual') {
      if (!topics.includes(topic.trim())) {
        setTopics([...topics, topic.trim()]);
      }
    } else {
      if (activeMemberId) {
        addTopicToMember(activeMemberId, topic.trim());
      }
    }
    setTopic('');
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(t => t !== topicToRemove));
  };

  const addMember = () => {
    if (members.length < 5) {
      const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
      setMembers([...members, { id: newId, name: `Member ${newId}`, topics: [], institution: '' }]);
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
      queryParams.set('institution', institution);
    } else {
      members.forEach(member => {
        queryParams.append(`member_${member.id}`, member.topics.join(','));
        queryParams.append(`member_${member.id}_institution`, member.institution);
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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">
            {mode === 'individual' ? 'Your Interests' : 'Group Interests'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'individual' 
              ? 'Enter your research topics and institution' 
              : 'Add topics for each group member'}
          </p>
        </div>

        {/* Individual Mode */}
        {mode === 'individual' && (
          <>
            {/* Topics Input */}
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={onSubmit} value={topic}            />

            {/* Institution Input */}
            <div className="mt-4">
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your institution (optional)"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
              />
            </div>

            {/* Display topics */}
            {topics.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {topics.map((t, idx) => (
                  <div key={idx} className="px-3 py-1 bg-primary/10 rounded-full text-sm flex items-center gap-2">
                    {t}
                    <button
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => handleRemoveTopic(t)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Group Mode */}
        {mode === 'group' && (
          <>
            {/* Member controls */}
            <div className="mb-4 flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={addMember}
                disabled={members.length >= 5}
              >
                <UserPlus size={16} className="mr-1" /> Add Member
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={removeMember}
                disabled={members.length <= 2}
              >
                <UserMinus size={16} className="mr-1" /> Remove Member
              </Button>
            </div>

            {/* Member selector */}
            <div className="mb-6 flex gap-2 flex-wrap justify-center">
              {members.map(member => (
                <button
                  key={member.id}
                  className={`px-4 py-2 rounded transition ${
                    activeMemberId === member.id
                      ? 'bg-primary text-white'
                      : 'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                  onClick={() => setActiveMemberId(member.id)}
                >
                  {member.name}
                </button>
              ))}
            </div>

            {/* Active member topics input */}
            {activeMemberId && (
              <>
                <PlaceholdersAndVanishInput
                  placeholders={placeholders}
                  onChange={handleChange}
                  onSubmit={onSubmit} value={topic}                />

               

                {/* Display topics for active member */}
                {members.find(m => m.id === activeMemberId)?.topics.length! > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {members.find(m => m.id === activeMemberId)?.topics.map((t, idx) => (
                      <div key={idx} className="px-3 py-1 bg-primary/10 rounded-full text-sm flex items-center gap-2">
                        {t}
                        <button
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => removeTopicFromMember(activeMemberId, idx)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Submit button */}
        <Button
          className="mt-8 w-full"
          onClick={handleSearch}
          disabled={isSearchDisabled()}
        >
          <Search size={16} className="mr-2" />
          Get Recommendations
        </Button>
      </div>
    </div>
  );
}

export default function TopicPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <TopicContent />
    </Suspense>
  );
}