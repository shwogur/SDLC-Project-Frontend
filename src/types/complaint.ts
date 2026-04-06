export interface Complaint {
    id: string;
    category: string | null;
    title: string;
    content: string;
    author: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
    createdAt: string | null;
    rejectionReason?: string | null;
    completionMessage?: string | null;
  }
  