"use client";



import { useState } from "react";



import {

  SquarePen,

  Search,

  Clock3,

  Code2,

  Bug,

  Zap,

  Settings2,

  PanelLeftClose,

  PanelLeftOpen,

  ChevronDown,

  X,

  Trash2,

  LoaderCircle,

  Pin,

  Pencil,

  Check,

  Folder,

  FolderPlus,

} from "lucide-react";





import type {

  Conversation,

  ConversationSearchResult,

  Folder as FolderType,

} from "@/types/chat";



interface SidebarProps {

  collapsed?: boolean;

  onToggleCollapse?: () => void;

  mobile?: boolean;

  onClose?: () => void;



  conversations: (Conversation | ConversationSearchResult)[];

  activeConversationId: number | null;



  searchQuery: string;

  onSearchChange: (query: string) => void;

  searchLoading: boolean;

  searchError: string | null;



  onNewConversation: () => void;

  onSelectConversation: (

    id: number,

    messageId?: number | null

) => void;

  onDeleteConversation: (id: number) => void;

  onTogglePinConversation: (

    id: number,

    isPinned: boolean

    ) => void;



  onRenameConversation: (

    id: number,

    title: string

    ) => void;

  onDeveloperTool: (prompt: string) => void;

    folders: FolderType[];

  onCreateFolder: (name: string) => Promise<FolderType | undefined>;
  onRenameFolder: (id: number, name: string) => Promise<void>;
  onDeleteFolder: (id: number) => Promise<void>;
  onMoveConversation: (
    conversationId: number,
    folderId: number | null
  ) => Promise<void>;

}



// ==========================================

// HIGHLIGHT SEARCH MATCHES

// ==========================================



function HighlightText({

  text,

  query,

}: {

  text: string;

  query: string;

}) {

  if (!query.trim()) {

    return <>{text}</>;

  }



  const escapedQuery = query.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );



  const parts = text.split(

    new RegExp(`(${escapedQuery})`, "gi")

  );



  return (

    <>

      {parts.map((part, index) => {

        const isMatch =

          part.toLowerCase() === query.toLowerCase();



        return isMatch ? (

          <mark

            key={index}

            className="rounded-sm bg-accent/20 px-0.5 text-accent"

          >

            {part}

          </mark>

        ) : (

          <span key={index}>{part}</span>

        );

      })}

    </>

  );

}



// ==========================================

// DEVELOPER TOOLS

// ==========================================



const developerTools = [

  {

    label: "Code explanation",

    icon: Code2,

    prompt: "Explain this code step by step: ",

  },

  {

    label: "Debug assistant",

    icon: Bug,

    prompt: "Help me debug this error: ",

  },

  {

    label: "Code optimization",

    icon: Zap,

    prompt: "Help me optimize this code: ",

  },

];



export default function Sidebar({

  collapsed = false,

  onToggleCollapse,

  mobile = false,

  onClose,

  conversations,

  activeConversationId,

  searchQuery,

  onSearchChange,

  searchLoading,

  searchError,

  onNewConversation,

  onSelectConversation,

  onDeleteConversation,

  onTogglePinConversation,

  onRenameConversation,

  folders,

  onCreateFolder,

  onRenameFolder,

  onDeleteFolder,

  onMoveConversation,

  onDeveloperTool,

}: SidebarProps) {

  const [showPinned, setShowPinned] = useState(true);

  const [showRecent, setShowRecent] = useState(true);



  const [editingId, setEditingId] = useState<number | null>(null);

  const [editingTitle, setEditingTitle] = useState("");

    const [expandedFolders, setExpandedFolders] = useState<number[]>([]);
  const [showUnassigned, setShowUnassigned] = useState(true);

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  const compact = collapsed && !mobile;



  const hasSearch = searchQuery.trim().length > 0;

  const pinnedConversations = conversations.filter(

    (conversation) => conversation.is_pinned

  );



  const recentConversations = conversations.filter(

    (conversation) => !conversation.is_pinned

  );



  const handleSelect = (

        id: number,

        messageId?: number | null

    ) => {

        onSelectConversation(id, messageId);

        onClose?.();

    };

  const handleNew = () => {

    onNewConversation();

    onClose?.();

  };



  const handleRenameStart = (

  id: number,

  title: string

) => {

  setEditingId(id);

  setEditingTitle(title);

};



const handleRenameSave = (id: number) => {

  const trimmedTitle = editingTitle.trim();



  if (!trimmedTitle) return;



  onRenameConversation(id, trimmedTitle);



  setEditingId(null);

  setEditingTitle("");

};



const handleRenameCancel = () => {

  setEditingId(null);

  setEditingTitle("");

};


  const toggleFolder = (folderId: number) => {
    setExpandedFolders((previous) =>
      previous.includes(folderId)
        ? previous.filter((id) => id !== folderId)
        : [...previous, folderId]
    );
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();

    if (!name) return;

    const created = await onCreateFolder(name);

    if (created) {
      setNewFolderName("");
      setCreatingFolder(false);
      setExpandedFolders((previous) => [...previous, created.id]);
    }
  };

  const handleSaveFolderRename = async (folderId: number) => {
    const name = editingFolderName.trim();

    if (!name) return;

    await onRenameFolder(folderId, name);

    setEditingFolderId(null);
    setEditingFolderName("");
  };

  const handleDeleteFolder = async (folderId: number) => {
    const confirmed = window.confirm(
      "Delete this folder? Its conversations will be moved to Unassigned."
    );

    if (!confirmed) return;

    await onDeleteFolder(folderId);
  };

  const unassignedConversations = conversations.filter(
    (conversation) => conversation.folder_id === null
  );






  return (

    <aside

      className={`flex h-full flex-col border-r border-border bg-sidebar transition-[width] duration-300 ${

        compact ? "w-[72px]" : "w-[260px]"

      }`}

    >

      {/* BRAND */}



      <div className="flex h-[72px] shrink-0 items-center justify-between px-4">

        <div className="flex items-center gap-3 overflow-hidden">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">

            <Code2 size={20} strokeWidth={1.8} />

          </div>



          {!compact && (

            <div className="whitespace-nowrap">

              <p className="text-sm font-semibold tracking-tight text-foreground">

                DevMind <span className="text-accent">AI</span>

              </p>



              <p className="text-[10px] tracking-wide text-muted">

                DEVELOPER WORKSPACE

              </p>

            </div>

          )}

        </div>



        {mobile ? (

          <button

            onClick={onClose}

            aria-label="Close sidebar"

            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"

          >

            <X size={18} />

          </button>

        ) : (

          <button

            onClick={onToggleCollapse}

            aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}

            title={compact ? "Expand sidebar" : "Collapse sidebar"}

            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"

          >

            {compact ? (

              <PanelLeftOpen size={17} />

            ) : (

              <PanelLeftClose size={17} />

            )}

          </button>

        )}

      </div>



      {/* NEW CONVERSATION */}



      <div className="px-3 pt-3">

        <button

          onClick={handleNew}

          title="New conversation"

          className={`flex h-10 w-full items-center gap-3 rounded-lg bg-accent px-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:brightness-105 ${

            compact ? "justify-center px-0" : ""

          }`}

        >

          <SquarePen size={17} />

          {!compact && <span>New conversation</span>}

        </button>

      </div>



      {/* SEARCH */}



      {!compact && (

        <div className="px-3 pt-5">

          <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 transition-colors focus-within:border-accent/60">

            <Search size={15} className="shrink-0 text-muted" />



            <input

              value={searchQuery}

              onChange={(event) =>

                onSearchChange(event.target.value)

              }

              placeholder="Search conversations"

              aria-label="Search conversations"

              className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted"

            />



            {searchLoading && (

              <LoaderCircle

                size={15}

                className="shrink-0 animate-spin text-accent"

              />

            )}



            {searchQuery && !searchLoading && (

              <button

                type="button"

                onClick={() => onSearchChange("")}

                aria-label="Clear search"

                className="rounded p-1 text-muted transition-colors hover:text-foreground"

              >

                <X size={14} />

              </button>

            )}

          </div>

        </div>

      )}



      {/* NAVIGATION */}



<div className="mt-7 flex-1 overflow-y-auto px-3">



  {/* SEARCH ERROR */}

  {!compact && searchError && (

    <p className="px-3 py-3 text-xs text-red-500">

      {searchError}

    </p>

  )}



  {/* COMPACT NAVIGATION */}

  {compact && (

    <button

      title="Recent conversations"

      onClick={onToggleCollapse}

      className="flex h-10 w-full items-center justify-center rounded-lg text-muted hover:bg-surface-elevated"

    >

      <Clock3 size={17} />

    </button>

  )}



  {!compact && (

    <div className="space-y-5">



      {/* SEARCH RESULTS */}

      {hasSearch ? (

        <div>

          <div className="mb-3 flex items-center justify-between px-2">

            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">

              Search results

            </span>



            {searchLoading && (

              <LoaderCircle

                size={13}

                className="animate-spin text-accent"

              />

            )}

          </div>



          {conversations.map((conversation) => {

            const searchResult =

              "match_type" in conversation

                ? conversation

                : null;



            return (

              <div

                key={conversation.id}

                className="group mb-2 rounded-lg"

              >

                <div className="flex items-center gap-1 px-1">

{editingId === conversation.id ? (
        <>
          <input
            autoFocus
            value={editingTitle}
            onChange={(event) => setEditingTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleRenameSave(conversation.id);
              if (event.key === "Escape") handleRenameCancel();
            }}
            aria-label="Conversation name"
            className="min-w-0 flex-1 rounded-md border border-accent/50 bg-surface px-2 py-2 text-xs text-foreground outline-none"
          />
          <button
            type="button"
            onClick={() => handleRenameSave(conversation.id)}
            disabled={!editingTitle.trim()}
            title="Save name"
            className="rounded-md p-1.5 text-green-600 hover:bg-green-500/10 disabled:opacity-40"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={handleRenameCancel}
            title="Cancel"
            className="rounded-md p-1.5 text-muted hover:bg-surface-elevated"
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <>




                  <button

                    type="button"

                    onClick={() =>

                      handleSelect(

                        conversation.id,

                        searchResult?.matched_message_id

                      )

                    }

                    className="flex min-w-0 flex-1 items-center gap-2 truncate px-2 py-2 text-left text-xs font-medium"

                  >

                    {conversation.is_pinned && (

                      <Pin

                        size={12}

                        className="shrink-0 fill-current text-accent"

                      />

                    )}



                    <span className="truncate">

                      <HighlightText

                        text={conversation.title}

                        query={searchQuery}

                      />

                    </span>

                  </button>



                  <button

                    type="button"

                    title={

                      conversation.is_pinned

                        ? "Unpin conversation"

                        : "Pin conversation"

                    }

                    onClick={() =>

                      onTogglePinConversation(

                        conversation.id,

                        !conversation.is_pinned

                      )

                    }

                    className="rounded-md p-1.5 text-muted opacity-0 transition-all hover:bg-accent/10 hover:text-accent group-hover:opacity-100 focus:opacity-100"

                  >

                    <Pin

                      size={13}

                      className={

                        conversation.is_pinned

                          ? "fill-current"

                          : ""

                      }

                    />

                  </button>



                  <button

                    type="button"

                    title="Rename conversation"

                    onClick={() =>

                      handleRenameStart(

                        conversation.id,

                        conversation.title

                      )

                    }

                    className="rounded-md p-1.5 text-muted opacity-0 group-hover:opacity-100 focus:opacity-100"

                  >

                    <Pencil size={13} />

                  </button>



                  <button

                    type="button"

                    title="Delete conversation"

                    onClick={() =>

                      onDeleteConversation(conversation.id)

                    }

                    className="rounded-md p-1.5 text-muted opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-500"

                  >

                    <Trash2 size={13} />

                  </button>



                
        </>
      )}
</div>



                {searchResult?.match_type === "message" &&

                  searchResult.matched_message_preview && (

                    <p className="line-clamp-3 px-3 pb-3 text-[11px] leading-relaxed text-muted">

                      <HighlightText

                        text={searchResult.matched_message_preview}

                        query={searchQuery}

                      />

                    </p>

                  )}

              </div>

            );

          })}



          {conversations.length === 0 && (

            <p className="px-3 py-4 text-xs text-muted">

              {searchLoading

                ? "Searching conversations..."

                : "No matching conversations found."}

            </p>

          )}

        </div>

      ) : (

        <>

                  {/* FOLDERS SECTION */}
          <section className="space-y-3">

            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Folders
              </span>

              <button
                type="button"
                title="Create folder"
                onClick={() => setCreatingFolder(true)}
                className="rounded-md p-1.5 text-muted hover:bg-accent/10 hover:text-accent"
              >
                <FolderPlus size={15} />
              </button>
            </div>

            {creatingFolder && (
              <div className="flex items-center gap-1 px-1">
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={(event) => setNewFolderName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void handleCreateFolder();
                    if (event.key === "Escape") {
                      setCreatingFolder(false);
                      setNewFolderName("");
                    }
                  }}
                  placeholder="Folder name"
                  className="min-w-0 flex-1 rounded-md border border-accent/50 bg-surface px-2 py-2 text-xs text-foreground outline-none"
                />

                <button
                  type="button"
                  onClick={() => void handleCreateFolder()}
                  disabled={!newFolderName.trim()}
                  className="rounded-md p-1.5 text-green-600 disabled:opacity-40"
                >
                  <Check size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreatingFolder(false);
                    setNewFolderName("");
                  }}
                  className="rounded-md p-1.5 text-muted"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {folders.map((folder) => {
              const folderConversations = conversations.filter(
                (conversation) => conversation.folder_id === folder.id
              );

              const isExpanded = expandedFolders.includes(folder.id);

              return (
                <div key={folder.id} className="space-y-1">

                  <div className="group flex items-center gap-1 rounded-lg px-1 hover:bg-surface-elevated">

                    {editingFolderId === folder.id ? (
                      <>
                        <input
                          autoFocus
                          value={editingFolderName}
                          onChange={(event) =>
                            setEditingFolderName(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              void handleSaveFolderRename(folder.id);
                            }

                            if (event.key === "Escape") {
                              setEditingFolderId(null);
                              setEditingFolderName("");
                            }
                          }}
                          className="min-w-0 flex-1 rounded-md border border-accent/50 bg-surface px-2 py-2 text-xs outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => void handleSaveFolderRename(folder.id)}
                          className="p-1 text-green-600"
                        >
                          <Check size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleFolder(folder.id)}
                          className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-xs text-muted hover:text-foreground"
                        >
                          <ChevronDown
                            size={13}
                            className={`shrink-0 transition-transform ${
                              isExpanded ? "" : "-rotate-90"
                            }`}
                          />

                          <Folder size={14} className="shrink-0 text-accent" />

                          <span className="flex-1 truncate">
                            {folder.name}
                          </span>

                          <span className="text-[10px]">
                            {folderConversations.length}
                          </span>
                        </button>

                        <button
                          type="button"
                          title="Rename folder"
                          onClick={() => {
                            setEditingFolderId(folder.id);
                            setEditingFolderName(folder.name);
                          }}
                          className="rounded p-1 text-muted opacity-0 group-hover:opacity-100 hover:text-accent"
                        >
                          <Pencil size={12} />
                        </button>

                        <button
                          type="button"
                          title="Delete folder"
                          onClick={() => void handleDeleteFolder(folder.id)}
                          className="rounded p-1 text-muted opacity-0 group-hover:opacity-100 hover:text-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="ml-5 space-y-1 border-l border-border pl-2">

                      {folderConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`group flex items-center gap-1 rounded-md ${
                            activeConversationId === conversation.id
                              ? "bg-accent/10 text-accent"
                              : "text-muted hover:bg-surface-elevated hover:text-foreground"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelect(conversation.id)}
                            className="min-w-0 flex-1 truncate px-2 py-2 text-left text-xs"
                          >
                            {conversation.title}
                          </button>

                          <select
                            aria-label={`Move ${conversation.title}`}
                            title="Move conversation"
                            value={folder.id}
                            onChange={(event) =>
                              void onMoveConversation(
                                conversation.id,
                                event.target.value === ""
                                  ? null
                                  : Number(event.target.value)
                              )
                            }
                            className="w-7 cursor-pointer bg-transparent text-[10px] text-muted outline-none"
                          >
                            <option value={folder.id}>↔</option>
                            <option value="">Unassigned</option>
                            {folders
                              .filter((item) => item.id !== folder.id)
                              .map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      ))}

                      {folderConversations.length === 0 && (
                        <p className="px-2 py-2 text-[11px] text-muted">
                          No conversations yet
                        </p>
                      )}

                    </div>
                  )}

                </div>
              );
            })}

            {/* UNASSIGNED CONVERSATIONS */}
            <div className="space-y-1">

              <button
                type="button"
                onClick={() => setShowUnassigned(!showUnassigned)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted hover:bg-surface-elevated hover:text-foreground"
              >
                <ChevronDown
                  size={13}
                  className={`transition-transform ${
                    showUnassigned ? "" : "-rotate-90"
                  }`}
                />

                <Folder size={14} />

                <span className="flex-1 text-left">Unassigned</span>

                <span className="text-[10px]">
                  {unassignedConversations.length}
                </span>
              </button>

              {showUnassigned && (
                <div className="ml-5 space-y-1 border-l border-border pl-2">

                  {unassignedConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`group flex items-center gap-1 rounded-md ${
                        activeConversationId === conversation.id
                          ? "bg-accent/10 text-accent"
                          : "text-muted hover:bg-surface-elevated hover:text-foreground"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(conversation.id)}
                        className="min-w-0 flex-1 truncate px-2 py-2 text-left text-xs"
                      >
                        {conversation.title}
                      </button>

                      <select
                        aria-label={`Move ${conversation.title}`}
                        title="Move conversation"
                        value=""
                        onChange={(event) => {
                          if (event.target.value) {
                            void onMoveConversation(
                              conversation.id,
                              Number(event.target.value)
                            );
                          }
                        }}
                        className="w-7 cursor-pointer bg-transparent text-[10px] text-muted outline-none"
                      >
                        <option value="">↔</option>
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  {unassignedConversations.length === 0 && (
                    <p className="px-2 py-2 text-[11px] text-muted">
                      No unassigned conversations
                    </p>
                  )}

                </div>
              )}
            </div>
          </section>
          
          {/* PINNED SECTION */}

          <section>



            <button

              type="button"

              onClick={() => setShowPinned(!showPinned)}

              className="mb-3 flex w-full items-center justify-between px-2"

            >

              <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">

                <Pin size={12} className="text-accent" />

                Pinned

                <span className="text-muted/70">

                  {pinnedConversations.length}

                </span>

              </span>



              <ChevronDown

                size={14}

                className={`text-muted transition-transform ${

                  showPinned ? "" : "-rotate-90"

                }`}

              />

            </button>



            {showPinned && (

              <div className="space-y-2">

                {pinnedConversations.map((conversation) => (

                  <div

                    key={conversation.id}

                    className={`group rounded-lg transition-colors ${

                      activeConversationId === conversation.id

                        ? "bg-accent/10 text-accent"

                        : "text-muted hover:bg-surface-elevated hover:text-foreground"

                    }`}

                  >

                    <div className="flex items-center gap-1 px-1">

{editingId === conversation.id ? (
        <>
          <input
            autoFocus
            value={editingTitle}
            onChange={(event) => setEditingTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleRenameSave(conversation.id);
              if (event.key === "Escape") handleRenameCancel();
            }}
            aria-label="Conversation name"
            className="min-w-0 flex-1 rounded-md border border-accent/50 bg-surface px-2 py-2 text-xs text-foreground outline-none"
          />
          <button
            type="button"
            onClick={() => handleRenameSave(conversation.id)}
            disabled={!editingTitle.trim()}
            title="Save name"
            className="rounded-md p-1.5 text-green-600 hover:bg-green-500/10 disabled:opacity-40"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={handleRenameCancel}
            title="Cancel"
            className="rounded-md p-1.5 text-muted hover:bg-surface-elevated"
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <>




                      <button

                        type="button"

                        onClick={() => handleSelect(conversation.id)}

                        className="flex min-w-0 flex-1 items-center gap-2 truncate px-2 py-2 text-left text-xs font-medium"

                      >

                        <Pin

                          size={12}

                          className="shrink-0 fill-current text-accent"

                        />



                        <span className="truncate">

                          {conversation.title}

                        </span>

                      </button>



                      <button

                        type="button"

                        title="Unpin conversation"

                        onClick={() =>

                          onTogglePinConversation(

                            conversation.id,

                            false

                          )

                        }

                        className="rounded-md p-1.5 text-accent opacity-100 hover:bg-accent/10"

                      >

                        <Pin size={13} className="fill-current" />

                      </button>



                      <button

                        type="button"

                        title="Rename conversation"

                        onClick={() =>

                          handleRenameStart(

                            conversation.id,

                            conversation.title

                          )

                        }

                        className="rounded-md p-1.5 text-muted opacity-0 group-hover:opacity-100 focus:opacity-100"

                      >

                        <Pencil size={13} />

                      </button>



                      <button

                        type="button"

                        title="Delete conversation"

                        onClick={() =>

                          onDeleteConversation(conversation.id)

                        }

                        className="rounded-md p-1.5 text-muted opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-500"

                      >

                        <Trash2 size={13} />

                      </button>



                    
        </>
      )}
</div>

                  </div>

                ))}



                {pinnedConversations.length === 0 && (

                  <p className="px-3 py-3 text-[11px] text-muted">

                    No pinned conversations.

                  </p>

                )}

              </div>

            )}

          </section>



          {/* RECENT SECTION */}

          <section>



            <button

              type="button"

              onClick={() => setShowRecent(!showRecent)}

              className="mb-3 flex w-full items-center justify-between px-2"

            >

              <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">

                <Clock3 size={12} />

                Recent

                <span className="text-muted/70">

                  {recentConversations.length}

                </span>

              </span>



              <ChevronDown

                size={14}

                className={`text-muted transition-transform ${

                  showRecent ? "" : "-rotate-90"

                }`}

              />

            </button>



            {showRecent && (

              <div className="space-y-2">



                {recentConversations.map((conversation) => (

                  <div

                    key={conversation.id}

                    className={`group rounded-lg transition-colors ${

                      activeConversationId === conversation.id

                        ? "bg-accent/10 text-accent"

                        : "text-muted hover:bg-surface-elevated hover:text-foreground"

                    }`}

                  >

                    <div className="flex items-center gap-1 px-1">

{editingId === conversation.id ? (
        <>
          <input
            autoFocus
            value={editingTitle}
            onChange={(event) => setEditingTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleRenameSave(conversation.id);
              if (event.key === "Escape") handleRenameCancel();
            }}
            aria-label="Conversation name"
            className="min-w-0 flex-1 rounded-md border border-accent/50 bg-surface px-2 py-2 text-xs text-foreground outline-none"
          />
          <button
            type="button"
            onClick={() => handleRenameSave(conversation.id)}
            disabled={!editingTitle.trim()}
            title="Save name"
            className="rounded-md p-1.5 text-green-600 hover:bg-green-500/10 disabled:opacity-40"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={handleRenameCancel}
            title="Cancel"
            className="rounded-md p-1.5 text-muted hover:bg-surface-elevated"
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <>




                      <button

                        type="button"

                        onClick={() => handleSelect(conversation.id)}

                        className="min-w-0 flex-1 truncate px-2 py-2 text-left text-xs font-medium"

                      >

                        {conversation.title}

                      </button>



                      <button

                        type="button"

                        title="Pin conversation"

                        onClick={() =>

                          onTogglePinConversation(

                            conversation.id,

                            true

                          )

                        }

                        className="rounded-md p-1.5 text-muted opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-accent"

                      >

                        <Pin size={13} />

                      </button>



                      <button

                        type="button"

                        title="Rename conversation"

                        onClick={() =>

                          handleRenameStart(

                            conversation.id,

                            conversation.title

                          )

                        }

                        className="rounded-md p-1.5 text-muted opacity-0 group-hover:opacity-100 focus:opacity-100"

                      >

                        <Pencil size={13} />

                      </button>



                      <button

                        type="button"

                        title="Delete conversation"

                        onClick={() =>

                          onDeleteConversation(conversation.id)

                        }

                        className="rounded-md p-1.5 text-muted opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-500"

                      >

                        <Trash2 size={13} />

                      </button>



                    
        </>
      )}
</div>

                  </div>

                ))}



                {recentConversations.length === 0 && (

                  <p className="px-3 py-3 text-[11px] text-muted">

                    No recent conversations.

                  </p>

                )}



              </div>

            )}

          </section>

        </>

      )}

    </div>

  )}



</div>

        {/* DEVELOPER TOOLS */}



        <div className="mt-8">

          {!compact && (

            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">

              Developer tools

            </p>

          )}



          <div className="space-y-1">

            {developerTools.map(

              ({ label, icon: Icon, prompt }) => (

                <button

                  key={label}

                  title={label}

                  onClick={() => {

                    onDeveloperTool(prompt);

                    onClose?.();

                  }}

                  className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted transition-colors hover:bg-surface-elevated hover:text-foreground ${

                    compact ? "justify-center px-0" : ""

                  }`}

                >

                  <Icon size={17} strokeWidth={1.8} />

                  {!compact && <span>{label}</span>}

                </button>

              )

            )}

          </div>

        </div>





      {/* BOTTOM */}



      <div className="shrink-0 border-t border-border p-3">

        <button

          title="Settings"

          onClick={() =>

            alert("Settings will be available in a future update.")

          }

          className={`mb-1 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted transition-colors hover:bg-surface-elevated hover:text-foreground ${

            compact ? "justify-center px-0" : ""

          }`}

        >

          <Settings2 size={17} />

          {!compact && <span>Settings</span>}

        </button>



        {!compact && (

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-border/70 bg-surface/70 p-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">

              <Code2 size={17} />

            </div>



            <div className="min-w-0">

              <p className="text-xs font-semibold text-foreground">

                DevMind AI

              </p>



              <p className="text-[10px] text-muted">

                Your development space

              </p>

            </div>

          </div>

        )}

      </div>

    </aside>

  );

}