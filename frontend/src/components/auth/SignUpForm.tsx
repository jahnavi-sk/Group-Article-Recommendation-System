
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { Badge } from '../ui/badge';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  topics: z.array(z.string()).optional(),
  hasPublished: z.boolean().default(false),
  hIndex: z.coerce.number().optional(),
  i10Index: z.coerce.number().optional(),
  worksCount: z.coerce.number().optional(),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSuccess: () => void;
}


const API_URL = "https://bc0211fc54fa.ngrok-free.app";


export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [topicInput, setTopicInput] = useState('');

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      topics: [],
      hasPublished: false,
    },
  });

  const hasPublished = form.watch('hasPublished');
  const topics = form.watch('topics') || [];

  const handleAddTopic = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && topicInput.trim() !== '') {
      e.preventDefault();
      const currentTopics = form.getValues('topics') || [];
      if (!currentTopics.includes(topicInput.trim())) {
        form.setValue('topics', [...currentTopics, topicInput.trim()]);
      }
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    const currentTopics = form.getValues('topics') || [];
    form.setValue('topics', currentTopics.filter(t => t !== topicToRemove));
  };


  const onSubmit = async (data: SignUpFormValues) => {
  setIsLoading(true);
  // Map topics to interests for backend
  const payload = {
    email: data.email,
    password: data.password,
    interests: data.topics || [],
  };
  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (res.ok) {
      localStorage.setItem('userEmail', data.email);
      toast({
        title: 'Account Created!',
        description: "You have successfully signed up.",
      });
      onSuccess();
    } else {
      toast({
        title: 'Signup Failed',
        description: result.error || 'An error occurred.',
        variant: 'destructive',
      });
    }
  } catch (e) {
    toast({
      title: 'Signup Failed',
      description: 'A network error occurred.',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
          <FormLabel>Topics of Interests in Research</FormLabel>
          <FormControl>
            <Input 
              placeholder="Add a topic and press Enter" 
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={handleAddTopic}
            />
          </FormControl>
          <div className="flex flex-wrap gap-2 pt-2">
            {topics.map(topic => (
              <Badge key={topic} variant="secondary" className="flex items-center gap-1">
                {topic}
                <button type="button" onClick={() => handleRemoveTopic(topic)} className="rounded-full hover:bg-muted-foreground/20">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <FormMessage />
        </FormItem>

        
        
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>
    </Form>
  );
}
