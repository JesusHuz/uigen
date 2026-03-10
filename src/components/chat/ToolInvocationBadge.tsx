import { Loader2, FilePlus, FilePenLine, Eye, Undo2, File } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolInvocation: {
    toolName: string;
    state: string;
    args: Record<string, unknown>;
    result?: unknown;
  };
}

const STR_REPLACE_COMMAND_MAP: Record<string, { label: string; Icon: React.ElementType }> = {
  create: { label: "Creating", Icon: FilePlus },
  str_replace: { label: "Editing", Icon: FilePenLine },
  insert: { label: "Editing", Icon: FilePenLine },
  view: { label: "Reading", Icon: Eye },
  undo_edit: { label: "Undoing", Icon: Undo2 },
};

function getStrReplaceLabel(args: Record<string, unknown>): { label: string; Icon: React.ElementType; path: string } {
  const command = args.command as string;
  const path = (args.path as string) ?? "";
  const filename = path.split("/").pop() ?? path;
  const mapped = STR_REPLACE_COMMAND_MAP[command];

  if (mapped) {
    return { label: `${mapped.label} ${filename}`, Icon: mapped.Icon, path };
  }

  return { label: filename, Icon: File, path };
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const { toolName, state, args, result } = toolInvocation;
  const isDone = state === "result" && result !== undefined;

  let label: string;
  let Icon: React.ElementType;
  let tooltipPath: string | undefined;

  if (toolName === "str_replace_editor") {
    const resolved = getStrReplaceLabel(args);
    label = resolved.label;
    Icon = resolved.Icon;
    tooltipPath = resolved.path;
  } else {
    label = toolName;
    Icon = File;
  }

  return (
    <div
      className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200"
      title={tooltipPath}
    >
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <Icon className="w-3 h-3 text-neutral-500 flex-shrink-0" />
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
