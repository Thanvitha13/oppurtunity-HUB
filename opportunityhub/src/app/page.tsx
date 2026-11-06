"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  CalendarDays,
  Code2,
  GraduationCap,
  Search,
  Plus,
  ExternalLink,
  Building2,
  Zap,
  AlertCircle,
} from "lucide-react";
import type { OpportunityDoc, OpportunityType } from "@/lib/opportunity";

/* ------------------------------------------------------------------ */
/*  Design tokens: one colour per opportunity category                 */
/* ------------------------------------------------------------------ */

const TYPE_META: Record<
  OpportunityType,
  { icon: typeof Briefcase; badge: string; dot: string }
> = {
  Internship: { icon: Briefcase, badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  Hackathon: { icon: Code2, badge: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  Scholarship: { icon: GraduationCap, badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Event: { icon: CalendarDays, badge: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
};

const FILTERS: { value: "All" | OpportunityType }[] = [
  { value: "All" },
  { value: "Internship" },
  { value: "Hackathon" },
  { value: "Scholarship" },
  { value: "Event" },
];

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

function daysLeft(deadline: string): number {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function deadlineChip(deadline: string) {
  const d = daysLeft(deadline);
  if (d < 0) return { text: "Expired", cls: "bg-muted text-muted-foreground" };
  if (d === 0) return { text: "Closes today!", cls: "bg-rose-600 text-white" };
  if (d <= 3) return { text: `Closes in ${d}d`, cls: "bg-rose-100 text-rose-700" };
  if (d <= 7) return { text: `Closes in ${d}d`, cls: "bg-amber-100 text-amber-800" };
  return { text: `Open ${d} more days`, cls: "bg-emerald-50 text-emerald-700" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  const { toast } = useToast();

  // Data state
  const [opportunities, setOpportunities] = useState<OpportunityDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [filter, setFilter] = useState<"All" | OpportunityType>("All");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ---------------- data loading ---------------- */

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/opportunities");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load opportunities");
      setOpportunities(data.opportunities);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------------- client-side filtering ---------------- */

  const visible = useMemo(() => {
    return opportunities.filter((o) => {
      const matchesType = filter === "All" || o.type === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.organisation.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [opportunities, filter, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: opportunities.length };
    for (const o of opportunities) c[o.type] = (c[o.type] || 0) + 1;
    return c;
  }, [opportunities]);

  /* ---------------- submit new opportunity ---------------- */

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      title: String(fd.get("title") || ""),
      organisation: String(fd.get("organisation") || ""),
      type: String(fd.get("type") || ""),
      link: String(fd.get("link") || ""),
      deadline: String(fd.get("deadline") || ""),
      description: String(fd.get("description") || ""),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not post opportunity");

      toast({
        title: "Opportunity posted!",
        description: `"${data.opportunity.title}" is now live on the board.`,
      });
      form.reset();
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast({
        title: "Could not post",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------- render ---------------- */

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white grid place-items-center shadow-sm">
              <Zap className="h-5 w-5" aria-hidden />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-lg tracking-tight">OpportunityHub</p>
              <p className="text-xs text-muted-foreground hidden sm:block">
                One board for every campus opportunity
              </p>
            </div>
          </div>

          {/* Post dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 shrink-0">
                <Plus className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Post Opportunity</span>
                <span className="sm:hidden">Post</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Share an opportunity</DialogTitle>
                <DialogDescription>
                  Found an internship, hackathon, scholarship or event? Post it so no student
                  misses it.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-1">
                <div className="grid gap-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required placeholder="e.g. Flipkart GRiD 6.0 - Registration" maxLength={120} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="organisation">Organisation</Label>
                  <Input id="organisation" name="organisation" required placeholder="e.g. Flipkart" maxLength={80} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="type">Category</Label>
                    <Select name="type" required defaultValue="Internship">
                      <SelectTrigger id="type" className="w-full">
                        <SelectValue placeholder="Pick one" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Internship">Internship</SelectItem>
                        <SelectItem value="Hackathon">Hackathon</SelectItem>
                        <SelectItem value="Scholarship">Scholarship</SelectItem>
                        <SelectItem value="Event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input id="deadline" name="deadline" type="date" required min={new Date().toISOString().split("T")[0]} />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="link">Application / info link</Label>
                  <Input id="link" name="link" type="url" required placeholder="https://..." />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    maxLength={600}
                    placeholder="Who can apply, eligibility, rewards, process..."
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Posting..." : "Publish"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b bg-gradient-to-b from-emerald-50/70 via-background to-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14 text-center">
            <Badge variant="outline" className="mb-4 gap-1.5 px-3 py-1">
              <Zap className="h-3 w-3 text-emerald-600" aria-hidden />
              Built for students, by students
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-balance">
              Never miss an opportunity again
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-balance">
              Internships, hackathons, scholarships and tech events are scattered across dozens of
              WhatsApp groups, LinkedIn posts and websites. OpportunityHub brings them all onto one
              board - so you see every deadline before it passes.
            </p>
            {!loading && !error && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="rounded-full border bg-background px-3 py-1 font-medium">
                  {counts.All} live opportunities
                </span>
                <span className="rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
                  {counts.Internship || 0} internships
                </span>
                <span className="rounded-full border bg-violet-50 text-violet-700 border-violet-200 px-3 py-1">
                  {counts.Hackathon || 0} hackathons
                </span>
                <span className="rounded-full border bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                  {counts.Scholarship || 0} scholarships
                </span>
                <span className="rounded-full border bg-rose-50 text-rose-700 border-rose-200 px-3 py-1">
                  {counts.Event || 0} events
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Filters */}
        <section aria-label="Filters" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sticky top-16 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const active = filter === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    aria-pressed={active}
                    className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors min-h-[44px] ${
                      active
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {f.value}
                    {!loading && (
                      <span className={`ml-1.5 text-xs ${active ? "opacity-70" : "text-muted-foreground"}`}>
                        ({counts[f.value] || 0})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="relative md:ml-auto w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, org, keywords..."
                className="pl-9"
                aria-label="Search opportunities"
              />
            </div>
          </div>
        </section>

        {/* List */}
        <section aria-label="Opportunities" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="font-medium">Could not load opportunities</p>
                <p className="mt-1 text-destructive/80">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-5 space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-9 w-28" />
                </div>
              ))}
            </div>
          ) : visible.length === 0 && !error ? (
            <div className="text-center py-16 rounded-xl border border-dashed">
              <p className="font-medium text-lg">No opportunities here yet</p>
              <p className="text-muted-foreground mt-1">
                {query ? `Nothing matches "${query}". Try another keyword.` : "Be the first to post one!"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((o) => {
                const meta = TYPE_META[o.type as OpportunityType] ?? TYPE_META.Internship;
                const Icon = meta.icon;
                const chip = deadlineChip(o.deadline);
                const expired = daysLeft(o.deadline) < 0;
                return (
                  <article
                    key={o._id}
                    className="group rounded-xl border bg-card p-5 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}>
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                        {o.type}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip.cls}`}>
                        {chip.text}
                      </span>
                    </div>

                    <h3 className={`font-semibold leading-snug line-clamp-2 ${expired ? "text-muted-foreground" : ""}`}>
                      {o.title}
                    </h3>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{o.organisation}</span>
                    </p>

                    <p className="text-sm text-muted-foreground line-clamp-3">{o.description}</p>

                    <div className="mt-auto pt-2 flex items-center justify-between border-t">
                      <span className="text-xs text-muted-foreground">
                        Apply by {formatDate(o.deadline)}
                      </span>
                      <Button asChild size="sm" variant={expired ? "outline" : "default"}>
                        <a href={o.link} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                          Apply
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </a>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Sticky footer */}
      <footer className="mt-auto border-t bg-muted/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-emerald-600" aria-hidden />
            <span className="font-medium text-foreground">OpportunityHub</span> — built with the MERN-style Next.js stack
          </p>
          <p>Next.js · MongoDB · Tailwind CSS · shadcn/ui</p>
        </div>
      </footer>
    </div>
  );
}
