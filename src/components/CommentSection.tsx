import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Send } from "lucide-react";
import { useCommentStore, useMemberStore } from "@/hooks/useStore";
import MemberAvatar from "./MemberAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface CommentSectionProps {
  taskId: string;
}

const CommentSection = ({ taskId }: CommentSectionProps) => {
  const { addComment, getCommentsForTask } = useCommentStore();
  const { members } = useMemberStore();
  const comments = getCommentsForTask(taskId);
  const [text, setText] = useState("");
  const [authorId, setAuthorId] = useState(members[0]?.id ?? "");

  const handleAdd = () => {
    if (!text.trim() || !authorId) return;
    addComment({ text: text.trim(), createdBy: authorId, taskId });
    setText("");
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-card-foreground">Kommentare ({comments.length})</h3>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.map((c) => {
          const member = members.find((m) => m.id === c.createdBy);
          return (
            <div key={c.id} className="flex gap-3 rounded-lg bg-muted/50 p-3">
              {member && <MemberAvatar name={member.name} color={member.avatarColor} size="sm" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-card-foreground">{member?.name ?? "Unbekannt"}</span>
                  <span className="text-muted-foreground">
                    {format(new Date(c.createdAt), "dd. MMM yyyy, HH:mm", { locale: de })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-card-foreground">{c.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Select value={authorId} onValueChange={setAuthorId}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Autor" />
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Kommentar schreiben..."
          className="flex-1"
          rows={1}
        />
        <Button size="icon" onClick={handleAdd} disabled={!text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CommentSection;
