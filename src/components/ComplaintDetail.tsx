import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, Calendar, User, Tag, XCircle } from "lucide-react";
import { Complaint } from "./types/complaint";
import { toast } from "sonner";
import api from "../api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface ComplaintDetailProps {
  complaint: Complaint;
  currentTab: string;
  onBack: (tab: string) => void;
  userType?: "student" | "council" | "teacher";
  userId?: string;
  onCancel: (id: string) => Promise<void>;
}


export default function ComplaintDetail({
  complaint,
  onBack,
  userType,
  userId,
  onCancel,
}: ComplaintDetailProps) {
  const [loading, setLoading] = useState(false);

  // 반려
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // ✅ 처리 완료
  const [completionMessage, setCompletionMessage] = useState("");

  /* =========================
     상태 뱃지
  ========================= */
  const getStatusBadge = (status: Complaint["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">검토 대기</Badge>;
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800">승인됨</Badge>;
      case "rejected":
        return <Badge variant="destructive">반려됨</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">처리중</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">완료</Badge>;
      default:
        return null;
    }
  };

  /* =========================
     학생 취소 가능 여부
  ========================= */
  const canCancel =
    userType === "student" &&
    userId === complaint.author &&
    complaint.status === "pending";

  /* =========================
     승인 / 반려
  ========================= */
  const updateStatus = async (
    status: "approved" | "rejected",
    reason?: string
  ) => {
    try {
      setLoading(true);

      await api.put(`/${complaint.id}`, {
        status,
        rejectionReason: reason,
      });

      toast.success(
        status === "approved"
          ? "민원이 승인되었습니다."
          : "민원이 반려되었습니다."
      );

      onBack();
    } catch (e) {
      console.error(e);
      toast.error("상태 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     민원 취소
  ========================= */
  const cancelComplaint = async () => {
    try {
      setLoading(true);
      await onCancel(complaint.id);
      toast.success("민원이 취소되었습니다.");
      onBack();
    } catch (e) {
      toast.error("민원 취소 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={16} /> 목록으로 돌아가기
        </Button>
        {getStatusBadge(complaint.status)}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{complaint.title}</CardTitle>
          <CardDescription className="flex gap-4">
            <span><Tag size={14} /> {complaint.category}</span>
            <span><User size={14} /> {complaint.author}</span>
            <span><Calendar size={14} /> {complaint.createdAt}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="whitespace-pre-wrap">{complaint.content}</p>

          {/* =========================
              승인 / 반려
          ========================= */}
          {userType === "council" && complaint.status === "pending" && (
            <>
              {!isRejecting ? (
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        승인
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          민원을 승인하시겠습니까?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          승인 후 처리 단계로 이동합니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => updateStatus("approved")}
                        >
                          확인
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    variant="destructive"
                    onClick={() => setIsRejecting(true)}
                  >
                    반려
                  </Button>
                </div>
              ) : (
                <div className="border rounded p-4 space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="반려 사유"
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => updateStatus("rejected", rejectReason)}
                    >
                      반려 확정
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsRejecting(false);
                        setRejectReason("");
                      }}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* =========================
              처리 완료
          ========================= */}
          {(userType === "council" || userType === "teacher") &&
            (complaint.status === "approved" ||
              complaint.status === "processing") && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    처리 완료
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      민원을 처리 완료하시겠습니까?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      처리 완료 메시지를 입력해주세요.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <textarea
                    value={completionMessage}
                    onChange={(e) => setCompletionMessage(e.target.value)}
                    placeholder="처리 완료 메시지"
                    className="w-full p-2 border rounded"
                  />

                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        if (!completionMessage.trim()) {
                          toast.error("처리 완료 메시지를 입력해주세요.");
                          return;
                        }
                        await api.put(`/${complaint.id}`, {
                          status: "completed",
                          completionMessage,
                        });
                        toast.success("민원이 처리 완료되었습니다.");
                        onBack();
                      }}
                    >
                      확인
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

          {/* =========================
              학생 취소
          ========================= */}
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle size={16} /> 민원 취소
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>민원을 취소하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    삭제 후 복구할 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={cancelComplaint}>
                    확인
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
