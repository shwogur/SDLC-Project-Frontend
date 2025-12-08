import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import LoginPage from "./components/LoginPage";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ComplaintForm from "./components/ComplaintForm";
import ComplaintList from "./components/ComplaintList";
import ComplaintDetail from "./components/ComplaintDetail";
import { toast } from "sonner";
import api from "./api";

export type UserType = 'student' | 'council' | 'teacher';
export type Page = 'dashboard' | 'form' | 'list' | 'detail';

export interface Complaint {
  id: string;
  category?: string | null;
  title: string;
  content: string;
  author: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  createdAt: string | null;
  assignedTo?: string | null;
  rejectionReason?: string | null;
  completionMessage?: string | null;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>('student');
  const [userId, setUserId] = useState('');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const handleLogin = (type: UserType, email: string) => {
    setUserType(type);
    setUserId(email);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType('student');
    setUserId('');
    setCurrentPage('dashboard');
    setSelectedComplaint(null);
    setComplaints([]);
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedComplaint(null);
  };

  const fetchComplaints = () => {
    api.get("/")
      .then(res => {
        const allComplaints: Complaint[] = res.data;
  
        if (userType === 'student') {
          // 본인 글만 가져오기
          setComplaints(allComplaints.filter(c => c.author?.trim() === userId.trim()));
        } else {
          setComplaints(allComplaints);
        }
      })
      .catch(err => {
        console.error("민원 가져오기 실패:", err);
        toast.error("민원 목록 불러오기 실패");
      });
  };

  useEffect(() => {
    if (isLoggedIn && userId.trim() !== "") {
      fetchComplaints();
    }
  }, [isLoggedIn, userId, userType]);

  // CRUD 핸들러
  const handleComplaintSubmit = (data: { category: string; title: string; content: string; }) => {
    const payload = { ...data, author: userId };
    api.post("/", payload)
      .then(res => {
        fetchComplaints(); // 등록 후 새로 목록 가져오기
        setCurrentPage('list');
        toast.success("민원이 등록되었습니다.");
      })
      .catch(err => toast.error("민원 등록 실패"));
  };

  const handleApprove = (id: string) => {
    api.put(`/${id}`, { status: 'approved', assignedTo: 'teacher@sdh.hs.kr' })
      .then(res => {
        toast.success("승인 완료");
        fetchComplaints(); // <- 여기서 최신 데이터 다시 가져오기
      })
      .catch(err => toast.error("승인 실패"));
  };
  
  const handleReject = (id: string, reason: string) => {
    api.put(`/${id}`, { status: 'rejected', rejectionReason: reason })
      .then(res => setComplaints(prev => prev.map(c => c.id === id ? res.data : c)))
      .catch(err => toast.error("반려 실패"));
  };

  const handleProcess = (id: string) => {
    api.put(`/${id}`, { status: 'processing' })
      .then(res => setComplaints(prev => prev.map(c => c.id === id ? res.data : c)))
      .catch(err => toast.error("처리 시작 실패"));
  };

  const handleComplete = (id: string, message?: string) => {
    api.put(`/${id}`, { status: 'completed', completionMessage: message })
      .then(res => setComplaints(prev => prev.map(c => c.id === id ? res.data : c)))
      .catch(err => toast.error("완료 처리 실패"));
  };

  const handleCancel = (id: string) => {
    api.delete(`/${id}`)
      .then(() => setComplaints(prev => prev.filter(c => c.id !== id)))
      .catch(err => toast.error("취소 실패"));
  };

  const handleViewDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setCurrentPage('detail');
  };

  if (!isLoggedIn) {
    return <>
      <LoginPage onLogin={handleLogin} />
      <Toaster />
    </>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userType={userType} userId={userId} onLogout={handleLogout} />
      <main className="container mx-auto px-6 py-8">
        {currentPage === 'dashboard' &&
          <Dashboard userType={userType} userId={userId} complaints={complaints} onNavigate={handleNavigate} />}
        {currentPage === 'form' && userType === 'student' &&
          <ComplaintForm
            onSubmit={handleComplaintSubmit}
            onBack={() => setCurrentPage('dashboard')}
          />}
        {currentPage === 'list' &&
          <ComplaintList
            complaints={complaints}
            userType={userType}
            userId={userId}
            onViewDetail={handleViewDetail}
            onApprove={handleApprove}
            onReject={handleReject}
            onProcess={handleProcess}
            onComplete={handleComplete}
            onCancel={handleCancel}
            onBack={() => setCurrentPage('dashboard')}
          />}
        {currentPage === 'detail' && selectedComplaint &&
          <ComplaintDetail complaint={selectedComplaint} userType={userType} userId={userId} onBack={() => setCurrentPage('list')} onCancel={handleCancel} />}
      </main>
      <Toaster />
    </div>
  );
}
