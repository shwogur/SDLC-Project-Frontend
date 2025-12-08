import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, Calendar, User, Tag, XCircle } from "lucide-react";
import { Complaint } from "./ComplaintList";
import api from "../api";
import { toast } from "sonner@2.0.3";
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
  onBack: () => void;
  userType?: 'student' | 'council' | 'teacher';
  userId?: string;
  onUpdated?: () => void; // 상태 변경 후 리스트 갱신
}

export default function ComplaintDetail({ complaint, onBack, userType, userId, onUpdated }: ComplaintDetailProps) {
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">검토 대기</Badge>;
      case 'approved': return <Badge className="bg-blue-100 text-blue-800">승인됨</Badge>;
      case 'rejected': return <Badge variant="destructive">반려됨</Badge>;
      case 'processing': return <Badge className="bg-yellow-100 text-yellow-800">처리중</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-800">완료</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const canCancel = userType === 'student' &&
                    userId === complaint.author &&
                    complaint.status === 'pending';

  // PUT 요청 예시: 상태 변경
  const updateStatus = async (status: string, completionMessage?: string) => {
    try {
      setLoading(true);
      await api.put(`/${complaint.id}`, { status, completionMessage });
      toast.success("민원 상태가 업데이트되었습니다.");
      onUpdated?.();
    } catch (err) {
      console.error(err);
      toast.error("상태 변경 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // DELETE 요청: 학생 민원 취소
  const cancelComplaint = async () => {
    try {
      setLoading(true);
      await api.delete(`/${complaint.id}`);
      toast.success("민원이 취소되었습니다.");
      onUpdated?.();
      onBack();
    } catch (err) {
      console.error(err);
      toast.error("민원 취소 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft size={16} />
          <span>목록으로 돌아가기</span>
        </Button>

        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center space-x-2">
                <XCircle size={16} />
                <span>민원 취소</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>민원을 취소하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  이 작업은 되돌릴 수 없습니다. 민원이 완전히 삭제됩니다.
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
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{complaint.title}</CardTitle>
              <CardDescription className="flex items-center space-x-4 text-base">
                <div className="flex items-center space-x-1"><Tag size={16} /><span>{complaint.category}</span></div>
                <div className="flex items-center space-x-1"><User size={16} /><span>{complaint.author}</span></div>
                <div className="flex items-center space-x-1"><Calendar size={16} /><span>{complaint.createdAt}</span></div>
              </CardDescription>
            </div>
            <div className="ml-4">{getStatusBadge(complaint.status)}</div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3">민원 내용</h3>
            <div className="bg-white border rounded-lg p-4">
              <p className="whitespace-pre-wrap leading-relaxed">{complaint.content}</p>
            </div>
          </div>

          {complaint.rejectionReason && (
            <div>
              <h3 className="mb-3 text-red-600">반려 사유</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{complaint.rejectionReason}</p>
              </div>
            </div>
          )}

          {complaint.completionMessage && (
            <div>
              <h3 className="mb-3 text-green-600">처리 완료 메시지</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">{complaint.completionMessage}</p>
              </div>
            </div>
          )}

          {complaint.assignedTo && (
            <div>
              <h3 className="mb-3">담당자</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">담당 교사: {complaint.assignedTo}</p>
              </div>
            </div>
          )}

          {/* 예시: 학생회/교사 상태 변경 버튼 */}
          {userType === 'council' && complaint.status === 'pending' && (
            <div className="flex space-x-2">
              <Button disabled={loading} onClick={() => updateStatus('approved')} className="bg-green-600 hover:bg-green-700">승인</Button>
              <Button disabled={loading} onClick={() => updateStatus('rejected', '반려 사유 입력')} className="bg-red-600 hover:bg-red-700">반려</Button>
            </div>
          )}

          {userType === 'teacher' && complaint.status === 'approved' && (
            <div className="flex space-x-2">
              <Button disabled={loading} onClick={() => updateStatus('processing')} className="bg-yellow-500 hover:bg-yellow-600">처리중</Button>
              <Button disabled={loading} onClick={() => updateStatus('completed', '처리 완료 메시지')} className="bg-green-600 hover:bg-green-700">완료</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
