import { useState } from "react";
import { Complaint } from "./types/complaint";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";
import { toast } from "sonner";

interface ComplaintListProps {
  complaints: Complaint[];
  userType: "student" | "council" | "teacher";
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
  onBack,
}: ComplaintListProps) {
  const [rejectReason, setRejectReason] = useState("");

  const getStatusBadge = (status: string) => {
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
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // 학생 계정 기준 필터
  const filtered =
    userType === "student"
      ? complaints.filter(
          (c) => String(c.author).trim() === String(userId).trim()
        )
      : complaints;

  const pending = filtered.filter((c) => c.status === "pending");
  const processing = filtered.filter(
    (c) => c.status === "approved" || c.status === "processing"
  );
  const completed = filtered.filter((c) => {
    if (userType === "student") {
      return c.status === "completed" || c.status === "rejected";
    }
    return c.status === "completed";
  });
  

  const renderCard = (complaint: Complaint) => (
    <Card key={complaint.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{complaint.title}</CardTitle>
            <CardDescription className="mt-1">
              {complaint.category} • {complaint.author} •{" "}
              {complaint.createdAt}
            </CardDescription>
          </div>
          <div>{getStatusBadge(complaint.status)}</div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-700 mb-4 line-clamp-2">
          {complaint.content}
        </p>

        {complaint.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            반려 사유: {complaint.rejectionReason}
          </div>
        )}

        {complaint.completionMessage && (
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
            처리 완료 메시지: {complaint.completionMessage}
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetail(complaint)}
          >
            상세보기
          </Button>

          {/* 승인 / 반려 */}
          {userType === "council" && complaint.status === "pending" && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm">승인</Button>
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
                      onClick={async () => {
                        await onApprove(complaint.id);
                        toast.success("민원이 승인되었습니다.");
                      }}
                    >
                      확인
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    반려
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      민원을 반려하시겠습니까?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      반려 사유를 입력해야 합니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="반려 사유"
                    className="w-full p-2 border rounded mt-2"
                  />

                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => setRejectReason("")}
                    >
                      취소
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        if (!rejectReason.trim()) {
                          toast.error("반려 사유를 입력해주세요.");
                          return;
                        }
                        await onReject(complaint.id, rejectReason);
                        toast.success("민원이 반려되었습니다.");
                        setRejectReason("");
                      }}
                    >
                      확인
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {/* 처리중 (선생님만) */}
          {userType === "teacher" && complaint.status === "approved" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onProcess(complaint.id)}
            >
              처리중
            </Button>
          )}

          {/* 삭제 (학생) */}
          {userType === "student" && complaint.status === "pending" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  취소
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    민원을 취소하시겠습니까?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    삭제 후 복구할 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await onCancel(complaint.id);
                      toast.success("민원이 취소되었습니다.");
                    }}
                  >
                    확인
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* ❌ 처리 완료 버튼: 진행중 탭에서는 완전히 비활성화 */}
          {false && <Button size="sm">처리 완료</Button>}
        </div>
      </CardContent>
    </Card>
  );

  const tabTitle = (label: string, count: number) =>
    `${label} (${count})`;

  return (
    <div className="max-w-4xl mx-auto">
      {onBack && (
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={16} /> 대시보드로 돌아가기
        </Button>
      )}

      <h2 className="my-4 text-2xl font-bold">민원 목록</h2>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            {tabTitle("대기중", pending.length)}
          </TabsTrigger>
          <TabsTrigger value="processing">
            {tabTitle("진행중", processing.length)}
          </TabsTrigger>
          <TabsTrigger value="completed">
            {tabTitle("완료", completed.length)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">{pending.map(renderCard)}</TabsContent>
        <TabsContent value="processing">
          {processing.map(renderCard)}
        </TabsContent>
        <TabsContent value="completed">{completed.map(renderCard)}</TabsContent>
      </Tabs>
    </div>
  );
}
