import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "partial-call" | "result";
}

function getLabel(toolName: string, args: Record<string, unknown>, isDone: boolean): string {
  const file = args.path ? String(args.path).split("/").pop() : undefined;
  const command = args.command as string | undefined;

  if (toolName === "str_replace_editor" && file) {
    switch (command) {
      case "create":
        return isDone ? `Created ${file}` : `Creating ${file}…`;
      case "str_replace":
        return isDone ? `Edited ${file}` : `Editing ${file}…`;
      case "insert":
        return isDone ? `Edited ${file}` : `Editing ${file}…`;
      case "view":
        return isDone ? `Read ${file}` : `Reading ${file}…`;
      case "undo_edit":
        return isDone ? `Undid edit to ${file}` : `Undoing edit to ${file}…`;
    }
  }

  if (toolName === "file_manager" && file) {
    switch (command) {
      case "rename":
        return isDone ? `Renamed ${file}` : `Renaming ${file}…`;
      case "delete":
        return isDone ? `Deleted ${file}` : `Deleting ${file}…`;
    }
  }

  return isDone ? "Done" : "Working…";
}

export function ToolInvocationBadge({ toolName, args, state }: ToolInvocationBadgeProps) {
  const isDone = state === "result";
  const label = getLabel(toolName, args, isDone);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
