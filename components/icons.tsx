// Import React to provide namespace for SVGProps
import React from 'react';
// Add Download icon to fix reported errors in Workspace.tsx and RosterPage.tsx
import {
    LayoutDashboard,
    Activity,
    Settings,
    Library,
    PlusCircle,
    LogOut,
    ChevronDown,
    ChevronRight,
    Search,
    Loader,
    Check,
    CheckCircle,
    XCircle,
    Globe,
    Copy,
    Trash2,
    ShieldCheck,
    BookUser,
    Menu,
    X,
    ClipboardPaste,
    Merge,
    Save,
    Share2,
    Download,
    Calendar,
    Twitter,
    Linkedin,
    Database,
    ChevronsLeft,
    Pencil,
    ArrowUpDown
} from 'lucide-react';

// Custom TikTok Icon (Lucide style)
const TikTok = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

export const Icons = {
    Dashboard: LayoutDashboard,
    Activity,
    Settings,
    Library,
    New: PlusCircle,
    Logout: LogOut,
    ChevronDown,
    ChevronRight,
    Search,
    Loader,
    Check,
    CheckCircle,
    Error: XCircle,
    Globe,
    Copy,
    Delete: Trash2,
    Shield: ShieldCheck,
    Roster: BookUser,
    Menu,
    Close: X,
    Paste: ClipboardPaste,
    Merge,
    Save,
    Sync: Share2,
    Share2,
    Download,
    Calendar,
    Twitter,
    TikTok,
    Linkedin,
    Database,
    ChevronsLeft,
    Pencil,
    Sort: ArrowUpDown
};