import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Clock, Plus } from "lucide-react";
import { useTimeEntryStore, useMemberStore } from "@/hooks/useStore";
import MemberAvatar from "./MemberAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface TimeEntrySectionProps {
  taskId: string;
}

const TimeEntrySection = ({ taskId }: TimeEntrySectionProps) => {
  const { addEntry, getEntriesForTask } = useTimeEntryStore();
  const { members } = useMemberStore();
  const entries = getEntriesForTask(taskId);
  const totalHours = entries.reduce((s, e) => s + e.hours, 0);

  const [memberId, setMemberId] = useState(members[0]?.id ?? "");
  const [hours, setHours] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleAdd = () => {
    const h = parseFloat(hours);
    if (!h || h <= 0 || !memberId) return;
    addEntry({ taskId, memberId, date, hours: h, description: desc.trim() });
    setHours("");
    setDesc("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-card-foreground">Zeiterfassung</h3>
        <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-medium text-card-foreground">
          <Clock className="h-3.5 w-3.5" /> {totalHours.toFixed(1)} Std.
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {entries.map((e) => {
          const member = members.find((m) => m.id === e.memberId);
          return (
            <div key={e.id} className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5 text-sm">
              {member && <MemberAvatar name={member.name} color={member.avatarColor} size="sm" />}
              <span className="text-muted-foreground">{format(new Date(e.date), "dd.MM.yy", { locale: de })}</span>
              <span className="font-medium text-card-foreground">{e.hours}h</span>
              <span className="flex-1 truncate text-muted-foreground">{e.description}</span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={memberId} onValueChange={setMemberId}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Mitglied" />
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[140px]" />
        <Input type="number" step="0.5" min="0" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Std." className="w-[80px]" />
        <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Beschreibung..." className="flex-1 min-w-[120px]" />
        <Button size="icon" onClick={handleAdd} disabled={!hours || parseFloat(hours) <= 0}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TimeEntrySection;
