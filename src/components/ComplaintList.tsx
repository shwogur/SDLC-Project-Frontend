import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Complaint } from "./App";

interface ComplaintListProps {
  complaints: Complaint[];
  userType: 'student' | 'council' | 'teacher';
  userId: string;
  onViewDetail: (complaint: Complaint) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onProcess: (id: string) => void;  
  onComplete: (id: string, message?: string) => void;
  onCancel: (id: string) => void;
  onBack?: () => void;
}

export default function ComplaintList({
  complaints,
  userType,
  userId,
  onViewDetail,
  onApprove,
  onReject,
  onProcess,
  onComplete,
  onCancel,
  onBack
}: ComplaintListProps) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState("");

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

  // 학생 계정 기준 필터
  const filterByUser = (list: Complaint[]) => {
    if (userType !== 'student') return list;

    return list.filter(c =>
      String(c.author).trim() === String(userId).trim()
    );
  };

  const filterByStatus = (list: Complaint[], status: string) =>
    list.filter(c => c.status === status);

  // 상태별 분류
  const filtered = filterByUser(complaints);
  const pending = filterByStatus(filtered, 'pending');
  const processing = filtered.filter(c => c.status === 'approved' || c.status === 'processing');
  const completed = filtered.filter(c => c.status === 'completed' || c.status === 'rejected');

  const handleRejectClick = (id: string) => {
    if (!rejectReason.trim()) return alert("반려 사유를 입력해주세요.");
    onReject(id, rejectReason);
    setRejectingId(null);
    setRejectReason("");
  };

  const handleCompleteClick = (id: string) => {
    if (!completionMessage.trim()) return alert("처리 완료 메시지를 입력해주세요.");
    onComplete(id, completionMessage);
    setCompletingId(null);
    setCompletionMessage("");
  };

  const renderCard = (complaint: Complaint) => (
    <Card key={complaint.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{complaint.title}</CardTitle>
            <CardDescription className="mt-1">{complaint.category} • {complaint.author} • {complaint.createdAt}</CardDescription>
          </div>
          <div>{getStatusBadge(complaint.status)}</div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4 line-clamp-2">{complaint.content}</p>

        {complaint.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">반려 사유: {complaint.rejectionReason}</div>
        )}
        {complaint.completionMessage && (
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">처리 완료 메시지: {complaint.completionMessage}</div>
        )}

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onViewDetail(complaint)}>상세보기</Button>

          {/* 승인 / 반려 */}
          {userType === 'council' && complaint.status === 'pending' && (
            <>
              <Button size="sm" onClick={() => onApprove(complaint.id)}>승인</Button>
              <Button variant="destructive" size="sm" onClick={() => setRejectingId(complaint.id)}>반려</Button>
            </>
          )}

          {/* 처리 */}
          {(userType === 'council' || userType === 'teacher') && (complaint.status === 'approved' || complaint.status === 'processing') && (
            <Button size="sm" onClick={() => setCompletingId(complaint.id)}>처리 완료</Button>
          )}

          {/* 처리중 */}
          {userType === 'teacher' && complaint.status === 'approved' && (
            <Button variant="outline" size="sm" onClick={() => onProcess(complaint.id)}>처리중</Button>
          )}

          {/* 삭제 */}
          {userType === 'student' && complaint.status === 'pending' && (
            <Button variant="destructive" size="sm" onClick={() => onCancel(complaint.id)}>취소</Button>
          )}
        </div>

        {/* 반려 사유 입력 */}
        {rejectingId === complaint.id && (
          <div className="mt-4 p-3 border rounded">
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="반려 사유"
              className="w-full p-2 border rounded"
            />
            <div className="flex mt-2 space-x-2">
              <Button size="sm" onClick={() => handleRejectClick(complaint.id)}>확인</Button>
              <Button variant="outline" size="sm" onClick={() => setRejectingId(null)}>취소</Button>
            </div>
          </div>
        )}

        {/* 처리 완료 메시지 */}
        {completingId === complaint.id && (
          <div className="mt-4 p-3 border rounded">
            <textarea
              value={completionMessage}
              onChange={e => setCompletionMessage(e.target.value)}
              placeholder="처리 완료 메시지"
              className="w-full p-2 border rounded"
            />
            <div className="flex mt-2 space-x-2">
              <Button size="sm" onClick={() => handleCompleteClick(complaint.id)}>확인</Button>
              <Button variant="outline" size="sm" onClick={() => setCompletingId(null)}>취소</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const tabTitle = (label: string, count: number) => `${label} (${count})`;

  return (
    <div className="max-w-4xl mx-auto">
      {onBack && <Button variant="outline" onClick={onBack}><ArrowLeft size={16} /> 대시보드로 돌아가기</Button>}
      <h2 className="my-4 text-2xl font-bold">민원 목록</h2>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">{tabTitle('대기중', pending.length)}</TabsTrigger>
          <TabsTrigger value="processing">{tabTitle('진행중', processing.length)}</TabsTrigger>
          <TabsTrigger value="completed">{tabTitle('완료', completed.length)}</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">{pending.map(renderCard)}</TabsContent>
        <TabsContent value="processing">{processing.map(renderCard)}</TabsContent>
        <TabsContent value="completed">{completed.map(renderCard)}</TabsContent>
      </Tabs>
    </div>
  );
}