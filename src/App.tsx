import { useState, useEffect } from "react";
import { Complaint } from "./types/complaint";
import { Toaster } from "./components/ui/sonner";
import LoginPage from "./components/LoginPage";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ComplaintForm from "./components/ComplaintForm";
import ComplaintList from "./components/ComplaintList";
import ComplaintDetail from "./components/ComplaintDetail";
import { toast } from "sonner";
import api from "./api";

export type UserType = "student" | "council" | "teacher";
export type Page = "dashboard" | "form" | "list" | "detail";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>("student");
  const [userId, setUserId] = useState("");

  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // 🔑 핵심 변경: 선택된 민원은 ID로만 관리
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    null
  );

  const selectedComplaint =
    complaints.find((c) => c.id === selectedComplaintId) || null;

  /* ======================
     🔐 로그인 유지
  ====================== */
  useEffect(() => {
    const saved = localStorage.getItem("loginInfo");
    if (saved) {
      const { userType, userId } = JSON.parse(saved);
      setUserType(userType);
      setUserId(userId);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (type: UserType, email: string) => {
    setUserType(type);
    setUserId(email);
    setIsLoggedIn(true);
    setCurrentPage("dashboard");
    localStorage.setItem(
      "loginInfo",
      JSON.stringify({ userType: type, userId: email })
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("loginInfo");
    setIsLoggedIn(false);
    setUserId("");
    setComplaints([]);
    setSelectedComplaintId(null);
    setCurrentPage("dashboard");
  };

  /* ======================
     📡 민원 목록 조회
  ====================== */
  const fetchComplaints = async () => {
    try {
      const res = await api.get("/");
      const serverList: Complaint[] = res.data;

      setComplaints((prev) => {
        const merged = prev.map((local) => {
          const serverItem = serverList.find((s) => s.id === local.id);

          if (!serverItem) return local;

          return {
            ...local,
            status: serverItem.status ?? local.status,
            createdAt: serverItem.created_at ?? local.createdAt,
            rejectionReason:
              serverItem.rejectionReason ?? local.rejectionReason,
            completionMessage:
              serverItem.completionMessage ?? local.completionMessage,
          };
        });

        // 서버에만 있는 새 민원 추가
        serverList.forEach((serverItem) => {
          if (!prev.find((p) => p.id === serverItem.id)) {
            merged.push(serverItem);
          }
        });

        // ✅ 학생 필터 (author 없는 데이터 보호)
        if (userType === "student") {
          return merged.filter(
            (c) => String(c.author ?? "").trim() === String(userId).trim()
          );
        }

        return merged;
      });
    } catch {
      toast.error("민원 목록 불러오기 실패");
    }
  };

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchComplaints();
    }
  }, [isLoggedIn, userId, userType]);

  /* ======================
     🔄 학생회 / 교사 자동 갱신
  ====================== */
  useEffect(() => {
    if (!isLoggedIn || userType === "student") return;
    const timer = setInterval(fetchComplaints, 5000);
    return () => clearInterval(timer);
  }, [isLoggedIn, userType]);

  /* ======================
     ✅ 상태 변경 로직
  ====================== */
  const updateLocalStatus = (id: string, patch: Partial<Complaint>) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  };

  const handleApprove = async (id: string) => {
    const res = await api.put(`/${id}`, { status: "approved" });

    updateLocalStatus(id, {
      status: "approved",
      ...(res.data ?? {}),
    });
  };

  const handleReject = async (id: string, reason: string) => {
    await api.put(`/${id}`, {
      status: "rejected",
      rejectionReason: reason,
    });
    updateLocalStatus(id, {
      status: "rejected",
      rejectionReason: reason,
    });
  };

  const handleProcess = async (id: string) => {
    await api.put(`/${id}`, { status: "processing" });
    updateLocalStatus(id, { status: "processing" });
  };

  const handleComplete = async (id: string, message?: string) => {
    await api.put(`/${id}`, {
      status: "completed",
      completionMessage: message,
    });
    updateLocalStatus(id, {
      status: "completed",
      completionMessage: message,
    });
  };

  const handleCancel = async (id: string) => {
    await api.delete(`/${id}`);
    setComplaints((prev) => prev.filter((c) => c.id !== id));
    if (selectedComplaintId === id) {
      setSelectedComplaintId(null);
      setCurrentPage("list");
    }
  };

  const handleSubmit = async (data: {
    category: string;
    title: string;
    content: string;
  }) => {
    await api.post("/", { ...data, author: userId });
    toast.success("민원이 등록되었습니다.");
    await fetchComplaints();
    setCurrentPage("list");
  };

  /* ======================
     🔐 로그인 전
  ====================== */
  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  /* ======================
     🧩 로그인 후
  ====================== */
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userType={userType} userId={userId} onLogout={handleLogout} />

      <main className="container mx-auto px-6 py-8">
        {currentPage === "dashboard" && (
          <Dashboard
            userType={userType}
            userId={userId}
            complaints={complaints}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === "form" && userType === "student" && (
          <ComplaintForm
            onSubmit={handleSubmit}
            onBack={() => setCurrentPage("dashboard")}
          />
        )}

        {currentPage === "list" && (
          <ComplaintList
            complaints={complaints}
            userType={userType}
            userId={userId}
            onViewDetail={(c) => {
              setSelectedComplaintId(c.id);
              setCurrentPage("detail");
            }}
            onApprove={handleApprove}
            onReject={handleReject}
            onProcess={handleProcess}
            onComplete={handleComplete}
            onCancel={handleCancel}
            onBack={() => setCurrentPage("dashboard")}
          />
        )}

        {currentPage === "detail" && selectedComplaint && (
          <ComplaintDetail
            complaint={selectedComplaint}
            userType={userType}
            userId={userId}
            onBack={() => setCurrentPage("list")}
            onCancel={handleCancel}
          />
        )}
      </main>

      <Toaster />
    </div>
  );
}
