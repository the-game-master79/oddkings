import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSportsManagement } from "@/hooks/useSportsManagement";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventsTable } from "@/components/admin/sports/EventsTable";
import { MatchesTable } from "@/components/admin/sports/MatchesTable";
import { SportsQuestionsTable } from "@/components/admin/sports/SportsQuestionsTable";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EventForm } from "@/components/admin/sports/EventForm";
import { MatchForm } from "@/components/admin/sports/MatchForm";
import { QuestionForm } from "@/components/admin/sports/QuestionForm";
import { StatsCard } from "@/components/admin/StatsCard";
import { useSportQuestionResolution } from "@/hooks/useSportQuestionResolution";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SportEvent, SportMatch, SportQuestion } from "@/types/sports";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export default function AdminSports() {
  const [activeTab, setActiveTab] = useState("events");
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [isMatchFormOpen, setIsMatchFormOpen] = useState(false);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<SportMatch | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<SportQuestion | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { 
    events,
    matches,
    questions,
    isLoading,
    createEvent,
    createMatch,
    createQuestion,
    deleteEvent,
    deleteMatch,
    deleteQuestion
  } = useSportsManagement();
  
  const { resolveYes, resolveNo } = useSportQuestionResolution();
  
  const handleResolveQuestion = async (id: string, outcome: boolean) => {
    try {
      if (outcome) {
        await resolveYes(id);
      } else {
        await resolveNo(id);
      }
      toast.success(`Question resolved to ${outcome ? 'Yes' : 'No'}`);
      queryClient.invalidateQueries({ queryKey: ['sport-questions'] });
    } catch (error) {
      console.error('Error resolving question:', error);
      toast.error('Failed to resolve question');
    }
  };
  
  const handleViewMatch = (matchId: string) => {
    navigate(`/admin/sports/match/${matchId}`);
  };
  
  const handleCreateEvent = async (formData: any) => {
    try {
      await createEvent(formData);
      setIsEventFormOpen(false);
      toast.success("Event created successfully");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  };
  
  const handleCreateMatch = async (formData: any) => {
    try {
      await createMatch(formData);
      setIsMatchFormOpen(false);
      toast.success("Match created successfully");
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error("Failed to create match");
    }
  };
  
  const handleCreateQuestion = async (formData: any) => {
    try {
      await createQuestion(formData);
      setIsQuestionFormOpen(false);
      toast.success("Question created successfully");
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question");
    }
  };

  // Add specific handlers for opening forms
  const openCreateEventForm = () => {
    setSelectedEvent(null);
    setIsEventFormOpen(true);
  };
  
  const openCreateMatchForm = () => {
    setSelectedMatch(null);
    setIsMatchFormOpen(true);
  };
  
  const openCreateQuestionForm = () => {
    setSelectedQuestion(null);
    setIsQuestionFormOpen(true);
  };

  // New query for fetching metrics
  const { data: metrics } = useQuery({
    queryKey: ['sport-metrics'],
    queryFn: async () => {
      try {
        // Get active questions for category counts
        const { data: activeQuestions } = await supabase
          .from('sport_questions')
          .select('category')
          .eq('status', 'active');

        // Get all categories from active questions
        const activeCategories = new Set(activeQuestions?.map(q => q.category) || []);
        
        // Count events with active questions
        const { data: eventsWithQuestions } = await supabase
          .from('sport_matches')
          .select(`
            event_id,
            sport_questions!inner (
              id,
              status
            )
          `)
          .eq('sport_questions.status', 'active');
        
        const activeEventsCount = new Set(eventsWithQuestions?.map(m => m.event_id) || []).size;

        // Count matches with active questions
        const { data: matchesWithQuestions } = await supabase
          .from('sport_questions')
          .select('match_id')
          .eq('status', 'active');
        
        const activeMatchesCount = new Set(matchesWithQuestions?.map(q => q.match_id) || []).size;

        // Get total counts
        const { count: totalEvents } = await supabase
          .from('sport_events')
          .select('*', { count: 'exact', head: true });

        const { count: totalMatches } = await supabase
          .from('sport_matches')
          .select('*', { count: 'exact', head: true });

        const { count: totalQuestions } = await supabase
          .from('sport_questions')
          .select('*', { count: 'exact', head: true });

        const { count: activeQuestionsCount } = await supabase
          .from('sport_questions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        return {
          activeCategories: activeCategories.size,
          activeEvents: activeEventsCount,
          activeMatches: activeMatchesCount,
          activeQuestions: activeQuestionsCount || 0,
          totalEvents: totalEvents || 0,
          totalMatches: totalMatches || 0,
          totalQuestions: totalQuestions || 0,
          totalCategories: 8, // Fixed number from SPORT_CATEGORIES
        };
      } catch (error) {
        console.error('Error fetching metrics:', error);
        return null;
      }
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Add filter functions
  const filteredEvents = (events || []).filter((event: SportEvent) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMatches = (matches || []).filter((match: SportMatch) =>
    match.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (match.sport_events?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuestions = (questions || []).filter((question: SportQuestion) =>
    question.status === 'active' &&
    (question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     (question.match_id || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Add handlers for deletions
  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleDeleteMatch = async (id: string) => {
    try {
      await deleteMatch(id);
    } catch (error) {
      console.error("Error deleting match:", error);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestion(id);
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sports Management</h1>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Active Categories"
          value={metrics?.activeCategories || 0}
          description="Categories with active questions"
        />
        <StatsCard
          title="Active Events"
          value={metrics?.activeEvents || 0}
          description="Events with active questions"
        />
        <StatsCard
          title="Active Matches"
          value={metrics?.activeMatches || 0}
          description="Matches with active questions"
        />
        <StatsCard
          title="Active Questions"
          value={metrics?.activeQuestions || 0}
          description="Currently active questions"
        />
        <StatsCard
          title="Total Categories"
          value={metrics?.totalCategories || 0}
          description="Available sport categories"
        />
        <StatsCard
          title="Total Events"
          value={metrics?.totalEvents || 0}
          description="Total events created"
        />
        <StatsCard
          title="Total Matches"
          value={metrics?.totalMatches || 0}
          description="Total matches created"
        />
        <StatsCard
          title="Total Questions"
          value={metrics?.totalQuestions || 0}
          description="Total questions created"
        />
      </div>
      
      <Tabs defaultValue="events" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>
          
          <Button onClick={
            activeTab === "events" ? openCreateEventForm :
            activeTab === "matches" ? openCreateMatchForm :
            openCreateQuestionForm
          }>
            <Plus className="h-4 w-4 mr-2" />
            Add {
              activeTab === "events" ? "Event" :
              activeTab === "matches" ? "Match" :
              "Question"
            }
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={`Search ${
                activeTab === "events" ? "events" :
                activeTab === "matches" ? "matches" :
                "questions"
              }...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <TabsContent value="events">
          <div>
            <EventsTable
              events={filteredEvents}
              isLoading={isLoading}
              onEdit={(event) => {
                setSelectedEvent(event);
                setIsEventFormOpen(true);
              }}
              onDelete={handleDeleteEvent}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="matches">
          <div>
            <MatchesTable
              matches={filteredMatches}
              isLoading={isLoading}
              onEdit={(match) => {
                setSelectedMatch(match);
                setIsMatchFormOpen(true);
              }}
              onDelete={handleDeleteMatch} // Add this line
            />
          </div>
        </TabsContent>
        
        <TabsContent value="questions">
          <SportsQuestionsTable
            questions={filteredQuestions}
            onResolveYes={(id) => handleResolveQuestion(id, true)}
            onResolveNo={(id) => handleResolveQuestion(id, false)}
            onEdit={(question) => {
              setSelectedQuestion(question);
              setIsQuestionFormOpen(true);
            }}
            onViewMatch={handleViewMatch}
            onDelete={handleDeleteQuestion}
          />
        </TabsContent>
      </Tabs>
      
      <Sheet open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedEvent ? "Edit Event" : "Create Event"}</SheetTitle>
            <SheetDescription>
              {selectedEvent ? "Update an existing sport event" : "Add a new sport event to the platform"}
            </SheetDescription>
          </SheetHeader>
          
          <EventForm
            isOpen={isEventFormOpen}
            onOpenChange={setIsEventFormOpen}
            onSubmit={handleCreateEvent}
            isLoading={isLoading}
            editingEvent={selectedEvent} // Add this prop
          />
        </SheetContent>
      </Sheet>
      
      <Sheet open={isMatchFormOpen} onOpenChange={setIsMatchFormOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedMatch ? "Edit Match" : "Create Match"}</SheetTitle>
            <SheetDescription>
              {selectedMatch ? "Update an existing sport match" : "Add a new sport match to an event"}
            </SheetDescription>
          </SheetHeader>
          
          <MatchForm
            isOpen={isMatchFormOpen}
            onOpenChange={setIsMatchFormOpen}
            onSubmit={handleCreateMatch}
            isLoading={isLoading}
            // The events array needs to be passed as a prop here
            events={events || []}
            editingMatch={selectedMatch} // Add this prop
          />
        </SheetContent>
      </Sheet>
      
      <Sheet open={isQuestionFormOpen} onOpenChange={setIsQuestionFormOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedQuestion ? "Edit Question" : "Create Question"}</SheetTitle>
            <SheetDescription>
              {selectedQuestion ? "Update an existing sport question" : "Add a new sport question to a match"}
            </SheetDescription>
          </SheetHeader>
          
          <QuestionForm
            isOpen={isQuestionFormOpen}
            onOpenChange={setIsQuestionFormOpen}
            onSubmit={handleCreateQuestion}
            isLoading={isLoading}
            // Pass the required data
            matches={matches || []}
            events={events || []}
            editingQuestion={selectedQuestion} // Add this prop
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
