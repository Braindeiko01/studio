"use client";

import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { CartoonButton } from '@/components/ui/CartoonButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Link as LinkIcon, CheckCircle, XCircle, UploadCloud, SwordsIcon, UserCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ChatMessage, User, Bet } from '@/types';
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/storage';

const CHAT_MESSAGES_STORAGE_KEY_PREFIX = 'royaleDuelChatMessages_';
const BET_HISTORY_STORAGE_KEY = 'royaleDuelBetHistory';


const ChatPageContent = () => {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter(); // Import useRouter from 'next/navigation'

  const matchId = params.matchId as string;
  const opponentTag = searchParams.get('opponentTag') || 'Opponent';
  const opponentAvatar = searchParams.get('opponentAvatar') || `https://placehold.co/40x40.png?text=${opponentTag[0] || 'O'}`;
  
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmittingResult, setIsSubmittingResult] = useState(false); // To show result submission UI
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [resultSubmitted, setResultSubmitted] = useState(false); // Track if current user submitted

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!user || !matchId) return;
    // Load messages from localStorage
    const storedMessages = getLocalStorageItem<ChatMessage[]>(`${CHAT_MESSAGES_STORAGE_KEY_PREFIX}${matchId}`);
    if (storedMessages) {
      setMessages(storedMessages);
    } else {
      // Add initial system message
      const initialMessage: ChatMessage = {
        id: `sys-${Date.now()}`,
        matchId,
        senderId: 'system',
        text: `Chat started for match with ${opponentTag}. Share your Clash Royale friend links to begin!`,
        timestamp: new Date().toISOString(),
        isSystemMessage: true,
      };
      setMessages([initialMessage]);
      setLocalStorageItem(`${CHAT_MESSAGES_STORAGE_KEY_PREFIX}${matchId}`, [initialMessage]);
    }
  }, [user, matchId, opponentTag]);

  const saveMessages = (updatedMessages: ChatMessage[]) => {
    setLocalStorageItem(`${CHAT_MESSAGES_STORAGE_KEY_PREFIX}${matchId}`, updatedMessages);
  }

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: `${user.id}-${Date.now()}`,
      matchId,
      senderId: user.id,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setNewMessage('');
  };
  
  const handleShareFriendLink = () => {
    if (!user) return;
    const friendLink = `Player ${user.clashTag} shared friend link: [ClashRoyaleFriendLinkPlaceholder]`; // Placeholder
    const message: ChatMessage = {
      id: `sys-${user.id}-${Date.now()}`,
      matchId,
      senderId: 'system',
      text: friendLink,
      timestamp: new Date().toISOString(),
      isSystemMessage: true,
    };
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    toast({ title: "Friend Link Shared", description: "Your (mock) friend link has been posted in chat." });
  };

  const handleResultSubmission = (result: 'win' | 'loss') => {
    if (!user || resultSubmitted) return;

    // Simulate result submission
    toast({
      title: "Result Submitted!",
      description: `You reported a ${result}. Waiting for opponent if needed, or admin verification.`,
      variant: "default",
    });
    
    const betResult: Bet = {
      id: `bet-${matchId}-${user.id}`,
      userId: user.id,
      matchId,
      amount: 6000, // Fixed amount
      result: result,
      opponentTag: opponentTag,
      matchDate: new Date().toISOString(),
    };

    // Update user balance (mock)
    const balanceChange = result === 'win' ? 6000 : -6000;
    // In a real app, updateUser would call an API. Here it's local.
    // This local updateUser won't persist across sessions without further logic.
    // Let's assume useAuth().updateUser can handle this:
    // useAuth().updateUser({ balance: user.balance + balanceChange });

    // Add to bet history in localStorage
    const historyKey = `${BET_HISTORY_STORAGE_KEY}_${user.id}`;
    const currentHistory = getLocalStorageItem<Bet[]>(historyKey) || [];
    setLocalStorageItem(historyKey, [...currentHistory, betResult]);
    
    setResultSubmitted(true);
    setIsSubmittingResult(false); // Close submission UI
    
    // Add a system message about result submission
     const resultMessage: ChatMessage = {
      id: `sys-result-${user.id}-${Date.now()}`,
      matchId,
      senderId: 'system',
      text: `${user.clashTag} submitted the match result as a ${result}. ${screenshotFile ? 'Screenshot provided.' : 'No screenshot provided.'}`,
      timestamp: new Date().toISOString(),
      isSystemMessage: true,
    };
    const updatedMessages = [...messages, resultMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);

    // Potentially navigate away or show a summary
    // router.push('/history'); // Option
  };


  if (!user) return <p>Loading chat...</p>;

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] md:h-[calc(100vh-180px)]"> {/* Adjusted height for AppLayout */}
      <Card className="flex-grow flex flex-col shadow-card-medieval border-2 border-primary-dark overflow-hidden">
        <CardHeader className="bg-primary/10 p-4 flex flex-row items-center justify-between border-b border-border">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-accent">
              <AvatarImage src={opponentAvatar} alt={opponentTag} data-ai-hint="gaming avatar opponent" />
              <AvatarFallback>{opponentTag?.[0] || 'O'}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-headline text-primary">{opponentTag}</CardTitle>
          </div>
          <CartoonButton size="small" variant="destructive" onClick={() => setIsSubmittingResult(true)} disabled={resultSubmitted}>
            {resultSubmitted ? 'Result Sent' : 'Submit Result'}
          </CartoonButton>
        </CardHeader>

        <ScrollArea className="flex-grow bg-background/50 p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : msg.senderId === 'system' ? 'justify-center' : 'justify-start'}`}>
              {msg.isSystemMessage ? (
                <div className="text-xs text-center text-muted-foreground italic bg-muted p-2 rounded-lg shadow-sm max-w-md my-1">
                  {msg.text}
                </div>
              ) : (
                <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl shadow-md ${msg.senderId === user.id ? 'bg-primary text-primary-foreground rounded-br-none ml-auto' : 'bg-card text-card-foreground rounded-bl-none mr-auto'}`}>
                  <p className="text-base">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.senderId === user.id ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="border-t border-border p-4 bg-card">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <Button type="button" variant="ghost" size="icon" onClick={handleShareFriendLink} aria-label="Share Friend Link">
              <LinkIcon className="h-6 w-6 text-primary hover:text-accent" />
            </Button>
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow text-lg py-3 h-12 border-2 focus:border-primary"
              aria-label="Chat message input"
            />
            <CartoonButton type="submit" size="small" className="px-5 py-3" aria-label="Send Message">
              <Send className="h-5 w-5" />
            </CartoonButton>
          </form>
        </div>
      </Card>

      {isSubmittingResult && !resultSubmitted && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <Card className="w-full max-w-lg shadow-xl border-2 border-accent">
            <CardHeader>
              <CardTitle className="text-3xl font-headline text-accent text-center">Submit Match Result</CardTitle>
              <CardDescription className="text-center text-muted-foreground">Declare the outcome of your duel with {opponentTag}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="screenshot" className="text-lg text-foreground mb-2 block flex items-center">
                  <UploadCloud className="mr-2 h-5 w-5 text-primary" /> Upload Screenshot (Optional)
                </Label>
                <Input 
                  id="screenshot" 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setScreenshotFile(e.target.files ? e.target.files[0] : null)}
                  className="text-base file:bg-primary file:text-primary-foreground hover:file:bg-primary-dark file:rounded-md file:border-0 file:px-4 file:py-2 file:mr-3 file:font-semibold"
                />
                {screenshotFile && <p className="text-sm text-muted-foreground mt-2">Selected: {screenshotFile.name}</p>}
              </div>
              <div className="flex justify-around space-x-4">
                <CartoonButton 
                  variant="default" 
                  onClick={() => handleResultSubmission('win')} 
                  className="flex-1 bg-green-500 hover:bg-green-600 border-green-700 text-white"
                  iconLeft={<CheckCircle />}
                >
                  I Won
                </CartoonButton>
                <CartoonButton 
                  variant="destructive" 
                  onClick={() => handleResultSubmission('loss')} 
                  className="flex-1"
                  iconLeft={<XCircle />}
                >
                  I Lost
                </CartoonButton>
              </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" onClick={() => setIsSubmittingResult(false)} className="w-full text-lg py-3">Cancel</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

// Need to import useRouter
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  return (
    <AppLayout>
      <ChatPageContent />
    </AppLayout>
  );
}
