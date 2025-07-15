import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle as DrawerHeading,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

interface Note {
  title: string;
  body: string;
}

interface DrawerHolderProps {
  /** Optional initial notes */
  notes?: Note[];
  /** Callback whenever notes change */
  onNotesChange?: (updated: Note[]) => void;
  /** Override the drawer trigger label */
  triggerLabel?: string;
  /** Extra Tailwind classes for the fixed trigger */
  className?: string;
}

/**
 * DrawerHolder – fixed bottom‑sheet with horizontally‑scrollable note cards.  
 * Click the ➕ button to open a modal for adding a note with *title* and *body*.
 */
const DrawerHolder: React.FC<DrawerHolderProps> = ({
  notes,
  onNotesChange,
  triggerLabel = "Open Notes",
  className,
}) => {
  /** Local state */
  const [internalNotes, setInternalNotes] = useState<Note[]>(notes ?? []);
  const [openDialog, setOpenDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // sync with parent prop
  useEffect(() => {
    if (notes && notes !== internalNotes) setInternalNotes(notes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  /* --------------------------------------------------------------------
   * Handlers
   * ------------------------------------------------------------------*/
  const handleAdd = () => {
    if (!title.trim() && !body.trim()) return; // nothing to add
    const next = [...internalNotes, { title: title.trim(), body: body.trim() }];
    setInternalNotes(next);
    onNotesChange?.(next);

    // reset + close
    setTitle("");
    setBody("");
    setOpenDialog(false);
  };

  const removeNote = (idx: number) => {
    const next = internalNotes.filter((_, i) => i !== idx);
    setInternalNotes(next);
    onNotesChange?.(next);
  };

  return (
    <Drawer>
      {/* ─────── Floating button to open the drawer */}
      <DrawerTrigger asChild>
        <button
          className={cn(
            "fixed bottom-6 inset-x-0 mx-auto w-fit bg-primary text-primary-foreground px-5 py-2 rounded-full shadow-lg focus:outline-none",
            className,
          )}
        >
          {triggerLabel}
        </button>
      </DrawerTrigger>

      {/* ─────── Drawer content */}
      <DrawerContent className="max-h-[70vh] overflow-y-auto pb-8">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerHeading>Notes</DrawerHeading>
          {/* ➕ button opens the modal */}
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <button
                aria-label="Add note"
                className="p-2 rounded-full hover:bg-muted focus:outline-none"
              >
                <Plus className="w-5 h-5" />
              </button>
            </DialogTrigger>

            {/* ─────── Modal for adding a note */}
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New Note</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
                <Textarea
                  placeholder="Body"
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>

              <DialogFooter className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAdd}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DrawerHeader>

        {/* ─────── Horizontally scrollable card list */}
        <div className="px-6 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            {internalNotes.length ? (
              internalNotes.map((note, i) => (
                <Card key={i} className="relative w-60 shrink-0 border-muted bg-muted/40">
                  {/* delete icon */}
                  <button
                    aria-label="Delete note"
                    onClick={() => removeNote(i)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-600 focus:outline-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <CardContent className="p-4 space-y-2">
                    <p className="font-semibold text-primary leading-tight">
                      {note.title || "(Untitled)"}
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {note.body || "…"}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerHolder;
