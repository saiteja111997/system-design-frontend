import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Lightbulb,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const suggestions = [
  { icon: TrendingUp, text: 'Find trending topics in my niche', category: 'Research' },
  { icon: FileText, text: 'Generate script for next video', category: 'Content' },
  { icon: ImageIcon, text: 'Create thumbnail variations', category: 'Design' },
  { icon: Lightbulb, text: 'Suggest video improvements', category: 'Optimization' }
];

const recentActions = [
  { time: '2 min ago', action: 'Generated script for "AI Tools Guide"' },
  { time: '15 min ago', action: 'Created 3 thumbnail variations' },
  { time: '1 hour ago', action: 'Analyzed trending topics' }
];

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export function AIAssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI assistant. I can help you with content research, script generation, SEO optimization, and much more. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInput('');

    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: "I'm analyzing your request. Based on your channel's performance, I recommend focusing on tutorial-style content with clear hooks in the first 5 seconds. Would you like me to generate a script based on this approach?",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="rounded-full w-16 h-16 bg-gradient-primary hover:bg-gradient-primary/80 shadow-xl hover:shadow-2xl transition-all"
            >
              <Sparkles className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] p-0">
            <SheetHeader className="p-6 pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <SheetTitle>AI Assistant</SheetTitle>
                  <p className="text-xs text-slate-500">Always here to help</p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Zap className="w-3 h-3" />
                  Active
                </Badge>
              </div>
            </SheetHeader>

            <div className="flex flex-col h-[calc(100vh-120px)]">
              <div className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg p-4 ${
                              message.type === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <span
                              className={`text-xs mt-2 block ${
                                message.type === 'user'
                                  ? 'text-blue-100'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>

                <div className="p-6 pt-4 border-t space-y-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestions.map((suggestion, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="justify-start gap-2 h-auto py-2 text-left"
                          onClick={() => setInput(suggestion.text)}
                        >
                          <suggestion.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs truncate">{suggestion.text}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask me anything..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-4 border-t bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-slate-500">Recent Activity</p>
                  <Clock className="w-3 h-3 text-slate-400" />
                </div>
                <div className="space-y-2">
                  {recentActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                    >
                      <ChevronRight className="w-3 h-3" />
                      <span className="text-slate-400">{action.time}</span>
                      <span className="flex-1">{action.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>
    </>
  );
}
